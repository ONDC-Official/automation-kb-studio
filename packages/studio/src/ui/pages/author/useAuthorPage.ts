import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useCoverageReport, useCoverageRuns } from "@/hooks/useCoverage";
import { useIdentity, useSubmitAccessRequest } from "@/hooks/useIdentity";
import {
  useExportManifest,
  useImportManifest,
  useManifest,
  useRestoreTopic,
  useSaveMeta,
} from "@/hooks/useManifest";
import { useCreateNode, useDeleteNode, useNodes, useRenameNode } from "@/hooks/useNodes";
import {
  useResolveSyncConflict,
  useSubmitProposal,
  useSync,
  useWithdrawProposal,
} from "@/hooks/useProposals";
import { pathKey, statusIndex, topicKey, topicRefFromFile, type StatusBucket } from "@/lib/derive";
import type { ApiError } from "@/services/httpClient";
import type { Change, DeletedEntry, Kind, Topic } from "@/services/types";
import { useEditors } from "./useEditors";

const errMsg = (e: unknown): string => (e as ApiError).message ?? String(e);

export function useAuthorPage() {
  const manifestQ = useManifest();
  const nodesQ = useNodes();
  const runsQ = useCoverageRuns();
  const { data: identity } = useIdentity();

  const newestFile = runsQ.data?.[0]?.file ?? null;
  const newestReport = useCoverageReport(newestFile);
  const index = useMemo(() => statusIndex(newestReport.data), [newestReport.data]);
  const hasCoverage = !!newestReport.data;

  const manifest = manifestQ.data ?? null;
  const nodes = nodesQ.data ?? [];
  const scopes = identity?.scopes ?? [[]];

  // ---- selection + filters (page-local UI state) -------------------------------------------------
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<Kind | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusBucket | null>(null);

  // Which global dialog is open (meta / history / review / request-access), or none.
  const [dialog, setDialog] = useState<"meta" | "history" | "review" | "requestAccess" | null>(null);

  const toggleCollapse = (path: string[]): void =>
    setCollapsed((c) => ({ ...c, [pathKey(path)]: !c[pathKey(path)] }));
  const toggleKind = (k: Kind): void => setKindFilter((f) => (f === k ? null : k));
  const toggleStatus = (b: StatusBucket): void => setStatusFilter((f) => (f === b ? null : b));

  // ---- editors (autosave machine) ----------------------------------------------------------------
  const editors = useEditors();
  const defaultNewPath = (): string[] => {
    if (selectedPath.length) return selectedPath;
    const top = nodes.find((n) => n.path.length === 1);
    return top ? top.path : [];
  };
  const onNewTopic = (kind: Kind): void => editors.openNew(kind, defaultNewPath());
  const onOpenTopic = (topic: Topic): void =>
    editors.openEdit(topic, manifest?.versions?.[topicKey(topic)] ?? null);

  // ---- node handlers -----------------------------------------------------------------------------
  const createNodeMut = useCreateNode();
  const renameNodeMut = useRenameNode();
  const deleteNodeMut = useDeleteNode();

  const createNode = async (path: string[]): Promise<void> => {
    try {
      await createNodeMut.mutateAsync(path);
      toast.success(`created ${path.join("/")}`);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const renameNode = async (from: string[], to: string[]): Promise<void> => {
    try {
      await renameNodeMut.mutateAsync({ from, to });
      toast.success(`${from.join("/")} → ${to.join("/")}`);
      if (pathKey(selectedPath).startsWith(pathKey(from))) setSelectedPath([]);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const deleteNode = async (path: string[], hasTopics: boolean): Promise<void> => {
    const label = path.join("/");
    let suffix = "";
    if (hasTopics) {
      const typed = window.prompt(`This deletes node "${label}" and ALL its topics. Type the node path to confirm:`, "");
      if (typed !== label) {
        if (typed !== null) toast.error("name didn't match — nothing deleted");
        return;
      }
      suffix = `?cascade=1&confirm=${encodeURIComponent(label)}`;
    } else if (!window.confirm(`Delete empty node "${label}"?`)) {
      return;
    }
    try {
      await deleteNodeMut.mutateAsync({ path, suffix });
      toast.success(`deleted ${label}`);
      if (pathKey(selectedPath).startsWith(label)) setSelectedPath([]);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  // ---- meta / export / import / restore ----------------------------------------------------------
  const saveMetaMut = useSaveMeta();
  const exportMut = useExportManifest();
  const importMut = useImportManifest();
  const restoreMut = useRestoreTopic();

  const saveMeta = async (id: string, version: string, subject: string, levels: string[]): Promise<void> => {
    try {
      await saveMetaMut.mutateAsync({ id, version, subject, levels });
      toast.success("saved identity");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const exportManifest = async (): Promise<void> => {
    try {
      const yaml = await exportMut.mutateAsync();
      const url = URL.createObjectURL(new Blob([yaml], { type: "application/x-yaml" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "manifest.yaml";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("downloaded manifest.yaml");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const importManifest = async (yaml: string): Promise<void> => {
    if (!window.confirm("Import this manifest.yaml? Topics with the same path/id are overwritten; existing topics not in the file are kept."))
      return;
    try {
      const r = await importMut.mutateAsync(yaml);
      toast.success(`imported ${String(r.topics)} topics`);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const restoreTopic = async (entry: DeletedEntry): Promise<void> => {
    const ref = topicRefFromFile(entry.file);
    if (!ref) return;
    try {
      await restoreMut.mutateAsync({ sha: entry.restoreSha, path: ref.path, id: ref.id });
      toast.success(`restored ${ref.id}`);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  // ---- review (author side) ----------------------------------------------------------------------
  const submitProposalMut = useSubmitProposal();
  const withdrawMut = useWithdrawProposal();
  const syncMut = useSync();
  const resolveConflictMut = useResolveSyncConflict();
  const [syncConflicts, setSyncConflicts] = useState<Change[] | null>(null);

  const submitForReview = async (note?: string): Promise<void> => {
    try {
      await submitProposalMut.mutateAsync(note);
      toast.success("submitted for review");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const withdrawProposal = async (): Promise<void> => {
    try {
      await withdrawMut.mutateAsync();
      toast.success("withdrew your proposal");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const syncWithMain = async (): Promise<void> => {
    try {
      const r = await syncMut.mutateAsync();
      if (r.conflicts.length) {
        setSyncConflicts(r.conflicts);
        toast.error(`synced — ${String(r.conflicts.length)} conflict(s) to resolve`);
      } else {
        toast.success(r.pulled ? `synced with main (${String(r.pulled)} update${r.pulled === 1 ? "" : "s"})` : "already up to date with main");
      }
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const resolveSyncConflict = async (key: string, choose: "mine" | "theirs"): Promise<void> => {
    try {
      await resolveConflictMut.mutateAsync({ key, choose });
      setSyncConflicts((cs) => {
        const left = (cs ?? []).filter((c) => c.key !== key);
        return left.length ? left : null;
      });
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  // ---- request access (viewer) -------------------------------------------------------------------
  const requestAccessMut = useSubmitAccessRequest();
  const submitAccessRequest = async (paths: string[][], note: string): Promise<void> => {
    try {
      await requestAccessMut.mutateAsync(note ? { paths, note } : { paths });
      toast.success("access request sent");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return {
    // data
    manifest,
    manifestError: manifestQ.isError ? errMsg(manifestQ.error) : null,
    nodes,
    identity,
    index,
    hasCoverage,
    scopes,
    // selection + filters
    selectedPath,
    selectPath: setSelectedPath,
    collapsed,
    toggleCollapse,
    query,
    setQuery,
    kindFilter,
    toggleKind,
    statusFilter,
    toggleStatus,
    // editors
    editors,
    onNewTopic,
    onOpenTopic,
    // node handlers (exposed as void — fire-and-forget; each toasts on error)
    createNode: (path: string[]): void => void createNode(path),
    renameNode: (from: string[], to: string[]): void => void renameNode(from, to),
    deleteNode: (path: string[], hasTopics: boolean): void => void deleteNode(path, hasTopics),
    // meta / io
    saveMeta: (id: string, version: string, subject: string, levels: string[]): void => void saveMeta(id, version, subject, levels),
    exportManifest: (): void => void exportManifest(),
    importManifest: (yaml: string): void => void importManifest(yaml),
    restoreTopic: (entry: DeletedEntry): void => void restoreTopic(entry),
    // review
    syncConflicts,
    dismissSyncConflicts: () => setSyncConflicts(null),
    submitForReview: (note?: string): void => void submitForReview(note),
    withdrawProposal: (): void => void withdrawProposal(),
    syncWithMain: (): void => void syncWithMain(),
    resolveSyncConflict: (key: string, choose: "mine" | "theirs"): void => void resolveSyncConflict(key, choose),
    // request access
    submitAccessRequest: (paths: string[][], note: string): void => void submitAccessRequest(paths, note),
    // dialogs
    dialog,
    setDialog,
  };
}

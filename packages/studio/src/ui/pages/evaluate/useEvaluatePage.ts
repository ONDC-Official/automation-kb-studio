import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useManifest } from "@/hooks/useManifest";
import { useNodes } from "@/hooks/useNodes";
import { useDeleteRun, useEvalRun, useEvalRuns, usePauseRun, useResumeRun, useStartRun } from "@/hooks/useRuns";
import { topicKey } from "@/lib/derive";
import type { NodeInfo, ResumeRequest, Topic } from "@/services/types";

import { DEFAULT_FORM } from "./constants";
import type { RunFormValues } from "./types";
import { endpointComplete, errMsg, toWire } from "./utils";

const EMPTY_TOPICS: Topic[] = [];
const EMPTY_NODES: NodeInfo[] = [];

export function useEvaluatePage() {
  const manifest = useManifest();
  const nodesQuery = useNodes();
  const topics = manifest.data?.topics ?? EMPTY_TOPICS;
  const nodes = nodesQuery.data ?? EMPTY_NODES;

  const runsQuery = useEvalRuns(true);
  const runs = runsQuery.data ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const showConfig = configOpen || runs.length === 0;

  // Auto-select the newest run once they load (unless the user is configuring a new one).
  useEffect(() => {
    if (!configOpen && selectedId === null && runs.length) setSelectedId(runs[0]!.id);
  }, [configOpen, selectedId, runs]);

  const detailQuery = useEvalRun(showConfig ? null : selectedId);
  const detail = detailQuery.data;

  const start = useStartRun();
  const pause = usePauseRun();
  const resume = useResumeRun();
  const remove = useDeleteRun();

  // Topic scope — defaults to "everything selected", kept synced until the user edits it.
  const allKeys = useMemo(() => topics.map(topicKey), [topics]);
  const [scope, setScope] = useState<Set<string>>(new Set());
  const scopeTouched = useRef(false);
  useEffect(() => {
    if (!scopeTouched.current) setScope(new Set(allKeys));
  }, [allKeys]);
  const onScope = (next: Set<string>): void => {
    scopeTouched.current = true;
    setScope(next);
  };

  const form = useForm<RunFormValues>({ defaultValues: DEFAULT_FORM });
  const values = form.watch();
  const canSubmit =
    endpointComplete(values.source) && endpointComplete(values.judge) && scope.size > 0;

  const submit = form.handleSubmit(async (v) => {
    if (scope.size === 0) {
      toast.error("Pick at least one topic to cover.");
      return;
    }
    const topicKeys = scope.size >= allKeys.length ? null : allKeys.filter((k) => scope.has(k));
    try {
      const { id } = await start.mutateAsync({ source: toWire(v.source), judge: toWire(v.judge), topicKeys });
      toast.success("Run started");
      setConfigOpen(false);
      setSelectedId(id);
    } catch (err) {
      toast.error(errMsg(err));
    }
  });

  const selectRun = (id: string): void => {
    setConfigOpen(false);
    setSelectedId(id);
  };
  const newRun = (): void => {
    setConfigOpen(true);
    setSelectedId(null);
  };

  const onPause = async (id: string): Promise<void> => {
    try {
      await pause.mutateAsync(id);
      toast.success("Run paused");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const onResume = async (id: string, req: ResumeRequest): Promise<void> => {
    try {
      await resume.mutateAsync({ id, req });
      toast.success("Run resumed");
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const onDelete = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this run? This stops it if it's still going and removes it for good.")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Run deleted");
      setSelectedId(null);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return {
    form,
    topics,
    nodes,
    scope,
    onScope,
    canSubmit,
    onSubmit: (): void => void submit(),
    submitting: start.isPending,
    resuming: resume.isPending,
    runs,
    selectedId,
    showConfig,
    detail,
    detailLoading: detailQuery.isLoading,
    running: detail?.status === "running",
    selectRun,
    newRun,
    onPause,
    onResume,
    onDelete,
  };
}

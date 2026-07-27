import { useState } from "react";

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Textarea from "@/components/Textarea";
import { pathKey } from "@/lib/derive";
import type { AccessRequest, NodeInfo } from "@/services/types";

const pathLabel = (p: string[]): string => (p.length ? p.join(" / ") : "root · everything");

interface IProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  nodes: NodeInfo[];
  initialPaths: string[][];
  pending: AccessRequest | null;
  onSubmit: (paths: string[][], note: string) => void;
}

/** A viewer picks the taxonomy path(s) they want to edit; the request lands in the admin queue. */
const RequestAccessDialog = ({ open, onOpenChange, nodes, initialPaths, pending, onSubmit }: IProps) => {
  const [picked, setPicked] = useState<Set<string>>(() => new Set((pending?.paths ?? initialPaths).map(pathKey)));
  const [note, setNote] = useState(pending?.note ?? "");
  const byKey = new Map<string, string[]>(nodes.map((n) => [pathKey(n.path), n.path]));

  const toggle = (key: string): void =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const submit = (): void => {
    const paths = [...picked].map((k) => byKey.get(k)).filter((p): p is string[] => p !== undefined);
    if (paths.length === 0) {
      window.alert("Pick at least one path to request access to.");
      return;
    }
    onSubmit(paths, note.trim());
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Request edit access"
      description={
        pending
          ? "You have a pending request. Updating it replaces the paths and note below."
          : "You’re a read-only viewer. Choose the area(s) you need and an admin will review."
      }
      footer={<Button onClick={submit}>{pending ? "Update request" : "Send request"}</Button>}
    >
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium text-neutral-600">Paths</span>
        {nodes.length === 0 ? (
          <div className="text-sm text-neutral-500">No taxonomy paths exist yet.</div>
        ) : (
          <div className="flex max-h-60 flex-col gap-1 overflow-auto">
            {nodes.map((n) => {
              const key = pathKey(n.path);
              return (
                <label key={key} className="flex items-center gap-2 rounded-sm px-1 py-0.5 text-sm hover:bg-neutral-200">
                  <input type="checkbox" checked={picked.has(key)} onChange={() => toggle(key)} />
                  <span>{pathLabel(n.path)}</span>
                </label>
              );
            })}
          </div>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">Message (optional)</span>
          <Textarea rows={3} placeholder="Why do you need access? (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
    </Dialog>
  );
};

export default RequestAccessDialog;

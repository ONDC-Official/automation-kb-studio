import { useState } from "react";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Textarea from "@/components/Textarea";
import { useProposals } from "@/hooks/useProposals";
import type { Change, Identity } from "@/services/types";

interface IProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  identity: Identity | null | undefined;
  syncConflicts: Change[] | null;
  dismissSyncConflicts: () => void;
  onSubmit: (note?: string) => void;
  onWithdraw: () => void;
  onSync: () => void;
  onResolve: (key: string, choose: "mine" | "theirs") => void;
}

/** The author side of review: submit/withdraw a proposal, sync with main, and resolve sync conflicts. */
const ReviewDialog = ({ open, onOpenChange, identity, syncConflicts, dismissSyncConflicts, onSubmit, onWithdraw, onSync, onResolve }: IProps) => {
  const { data: proposals } = useProposals(open);
  const [note, setNote] = useState("");
  const mine = proposals?.find((p) => p.workspace === identity?.workspace) ?? null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Review & sync"
      description="Submit your workspace for review, or pull the latest from main."
      footer={
        <Button variant="outline" onClick={onSync}>
          Sync with main
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {syncConflicts && syncConflicts.length > 0 && (
          <section className="flex flex-col gap-2 rounded-md border border-warn/40 bg-warn/10 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-warn">{syncConflicts.length} conflict(s) to resolve</span>
              <Button size="sm" variant="ghost" onClick={dismissSyncConflicts}>
                Dismiss
              </Button>
            </div>
            {syncConflicts.map((c) => (
              <div key={c.key} className="flex items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  <Badge tone="caution">{c.conflictKind ?? c.class}</Badge> {c.title || c.key}
                </span>
                <Button size="sm" variant="outline" onClick={() => onResolve(c.key, "theirs")}>
                  Take theirs
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onResolve(c.key, "mine")}>
                  Keep mine
                </Button>
              </div>
            ))}
          </section>
        )}

        {mine ? (
          <section className="flex flex-col gap-2 rounded-md border border-border p-3">
            <div className="text-sm font-medium">Submitted for review</div>
            <div className="flex flex-wrap gap-2 text-xs text-neutral-600">
              <Badge tone="ok">{mine.changes.added} added</Badge>
              <Badge tone="accent">{mine.changes.edited} edited</Badge>
              <Badge tone="muted">{mine.changes.deleted} deleted</Badge>
              {mine.changes.conflicted > 0 && <Badge tone="alarm">{mine.changes.conflicted} conflicted</Badge>}
            </div>
            {mine.note && <p className="text-sm text-neutral-600">{mine.note}</p>}
            <Button size="sm" variant="destructive" className="self-start" onClick={onWithdraw}>
              Withdraw
            </Button>
          </section>
        ) : identity?.review ? (
          <section className="flex flex-col gap-2">
            <span className="text-xs font-medium text-neutral-600">Note for the reviewer (optional)</span>
            <Textarea rows={3} placeholder="Summarize what changed…" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button className="self-start" onClick={() => onSubmit(note.trim() || undefined)}>
              Submit for review
            </Button>
          </section>
        ) : (
          <p className="text-sm text-neutral-500">Review isn’t enabled for this deployment. You can still sync with main.</p>
        )}
      </div>
    </Dialog>
  );
};

export default ReviewDialog;

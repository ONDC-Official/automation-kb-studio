import { ChevronDown, ChevronRight } from "lucide-react";

import Button from "@/components/Button";
import type { Proposal, ProposalDetail } from "@/services/types";

import ProposalDiff from "./ProposalDiff";

interface IProps {
  proposals: Proposal[] | undefined;
  loading: boolean;
  reviewEnabled: boolean;
  expandedId: string | null;
  detail: ProposalDetail | undefined;
  detailLoading: boolean;
  merging: boolean;
  onToggle: (id: string) => void;
  onMerge: (id: string) => void;
}

const ReviewQueue = ({
  proposals,
  loading,
  reviewEnabled,
  expandedId,
  detail,
  detailLoading,
  merging,
  onToggle,
  onMerge,
}: IProps) => {
  if (loading || !proposals) {
    return (
      <div className="text-xs text-neutral-600">
        {reviewEnabled ? "Loading…" : "Review flow not enabled on this deployment."}
      </div>
    );
  }
  if (proposals.length === 0) return <div className="text-xs text-neutral-600">No open proposals.</div>;

  return (
    <ul className="flex flex-col gap-2">
      {proposals.map((p) => {
        const c = p.changes;
        const open = expandedId === p.id;
        return (
          <li key={p.id} className="rounded-md border border-border p-2.5">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" title={open ? "Collapse" : "Expand"} onClick={() => onToggle(p.id)}>
                {open ? <ChevronDown /> : <ChevronRight />}
              </Button>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-foreground">
                  <code className="text-xs text-neutral-600">{p.workspace}</code> · by {p.authorName}
                </div>
                <div className="text-xs text-neutral-600">
                  +{c.added} ~{c.edited} −{c.deleted}
                  {c.conflicted > 0 && <span className="text-error"> · {c.conflicted} conflict(s)</span>}
                  {p.note ? ` · “${p.note}”` : ""}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={c.conflicted > 0 || merging}
                title={c.conflicted > 0 ? "Author must sync + resolve first" : "Merge into main"}
                onClick={() => onMerge(p.id)}
              >
                Merge
              </Button>
            </div>
            {open && (
              <div className="mt-2 pl-2">
                {detailLoading || !detail ? (
                  <div className="text-xs text-neutral-600">Loading diff…</div>
                ) : (
                  <ProposalDiff changes={detail.changes} />
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default ReviewQueue;

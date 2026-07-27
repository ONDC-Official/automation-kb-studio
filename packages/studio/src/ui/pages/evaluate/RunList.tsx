import Badge from "@/components/Badge";
import { cn } from "@/lib/utils";
import type { EvalRunSummary } from "@/services/types";

import { STATUS_LABEL, STATUS_TONE } from "./constants";
import { progressPct, relTime } from "./utils";

interface IProps {
  runs: EvalRunSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/** The runs strip: one chip per run with a status badge and a live % or age. */
const RunList = ({ runs, selectedId, onSelect }: IProps) => {
  if (!runs.length) {
    return <div className="text-xs text-neutral-500">No runs yet — configure one below.</div>;
  }
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {runs.map((r) => {
        const trailing =
          r.status === "running"
            ? `${String(progressPct(r.progress.done, r.progress.total))}%`
            : relTime(r.createdAt);
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            title={`${r.source.model || r.source.provider} · ${STATUS_LABEL[r.status]}`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm hover:border-accent",
              r.id === selectedId && "border-accent ring-2 ring-accent/40",
            )}
          >
            <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
            <span className="max-w-40 truncate font-medium text-foreground">
              {r.source.model || r.source.provider}
            </span>
            <span className="text-xs tabular-nums text-neutral-500">{trailing}</span>
          </button>
        );
      })}
    </div>
  );
};

export default RunList;

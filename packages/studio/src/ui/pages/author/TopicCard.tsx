import Badge from "@/components/Badge";
import StatusBadge from "@/components/StatusBadge";
import { topicKey, type StatusIndex } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { Topic } from "@/services/types";

/** A compact topic card (collapsed state). Clicking it opens the expanded editor in its place. */
const TopicCard = ({
  t,
  index,
  hasCoverage,
  onOpen,
}: {
  t: Topic;
  index: StatusIndex;
  hasCoverage: boolean;
  onOpen: () => void;
}) => {
  const result = index[topicKey(t)];
  return (
    <div className="anim-expand">
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full flex-col gap-1 rounded-md border border-border bg-surface p-3 text-left transition-colors hover:border-accent-400 hover:bg-neutral-200",
        t.kind === "canary" && "border-l-2 border-l-accent-2-500",
      )}
    >
      <span className="truncate text-sm font-medium">{t.title || "Untitled topic"}</span>
      <span className="font-mono text-xs text-neutral-500">{t.id}</span>
      <span className="line-clamp-2 text-xs text-neutral-600">{t.questions[0] || "No probe questions yet"}</span>
      <span className="mt-1 flex items-center gap-2">
        <span className="text-xs text-neutral-500">
          {t.questions.length} probe{t.questions.length === 1 ? "" : "s"}
        </span>
        <Badge tone={t.kind === "canary" ? "accent" : "neutral"}>{t.kind === "canary" ? "⚑ canary" : "real"}</Badge>
        {hasCoverage && (result ? <StatusBadge status={result.status} /> : <Badge tone="muted">no data</Badge>)}
      </span>
    </button>
    </div>
  );
};

export default TopicCard;

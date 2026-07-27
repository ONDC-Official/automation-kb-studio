import Badge from "@/components/Badge";
import Markdown from "@/components/Markdown";
import { cn } from "@/lib/utils";
import type { TopicProbe } from "@/services/types";

/** The verdict pills for one probe — reused in the question list and the detail-pane header. */
export const ProbeVerdict = ({ p }: { p: TopicProbe }) => (
  <div className="flex flex-wrap gap-1">
    <Badge tone={p.responsive ? "ok" : "muted"}>{p.responsive ? "responsive" : "not responsive"}</Badge>
    <Badge tone="neutral">specificity: {p.specificity}</Badge>
  </div>
);

/**
 * The per-phrasing question list: click a question to load its full response into the detail pane.
 * `selected` marks the active question; `onSelect` reports a click. Answers render in the detail pane.
 */
export const Transcript = ({
  probes,
  selected,
  onSelect,
}: {
  probes: TopicProbe[];
  selected: number | null;
  onSelect: (i: number) => void;
}) => (
  <div className="flex flex-col gap-1">
    {probes.map((p, i) => (
      <button
        type="button"
        key={i}
        onClick={() => onSelect(i)}
        className={cn(
          "flex flex-col gap-1 rounded-md border border-transparent px-2 py-1.5 text-left hover:bg-neutral-200",
          selected === i && "border-border bg-neutral-200",
        )}
      >
        <div className="text-sm">
          <span className="mr-1 font-mono text-xs text-neutral-500">Q{probes.length > 1 ? String(i + 1) : ""}</span>
          {p.question}
        </div>
        <ProbeVerdict p={p} />
      </button>
    ))}
  </div>
);

/** The question whose full answer the sticky detail pane shows. Shared by the report and live feed. */
export interface Selection {
  key: string;
  title: string;
  probe: TopicProbe;
}

/** The sticky right-hand pane: the full response to the selected question, rendered as markdown. */
export const AnswerDetail = ({ selection }: { selection: Selection | null }) => (
  <aside className="flex h-full flex-col overflow-auto rounded-md border border-border bg-surface p-3">
    {selection ? (
      <>
        <div className="mb-3 flex flex-col gap-1 border-b border-border pb-3">
          <div className="text-sm font-medium">{selection.probe.question}</div>
          <div className="text-xs text-neutral-600">{selection.title}</div>
          <ProbeVerdict p={selection.probe} />
        </div>
        <div className="min-h-0 flex-1">
          {selection.probe.refused ? (
            <em className="text-neutral-500">(no answer — the source reported no result)</em>
          ) : (
            <Markdown text={selection.probe.answer} />
          )}
        </div>
      </>
    ) : (
      <div className="grid h-full place-items-center text-sm text-neutral-500">
        Click a question to read its full response here.
      </div>
    )}
  </aside>
);

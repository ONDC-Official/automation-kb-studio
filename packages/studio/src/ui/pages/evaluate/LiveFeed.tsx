import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import Badge from "@/components/Badge";
import StatusBadge from "@/components/StatusBadge";
import { AnswerDetail, Transcript, type Selection } from "@/components/Transcript";
import { cn } from "@/lib/utils";
import type { EvalRunDetail, RunLogEntry } from "@/services/types";

import { TALLY } from "./constants";
import { progressPct } from "./utils";

/** A live-updating "3m 12s" from a start timestamp. */
function useElapsed(startedAt: string | null): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!startedAt) return "0s";
  const secs = Math.max(0, Math.round((now - new Date(startedAt).getTime()) / 1000));
  return secs < 60 ? `${String(secs)}s` : `${String(Math.floor(secs / 60))}m ${String(secs % 60)}s`;
}

const Tally = ({ log }: { log: RunLogEntry[] }) => {
  const counts = new Map<string, number>();
  for (const e of log) counts.set(e.status, (counts.get(e.status) ?? 0) + 1);
  return (
    <div className="flex flex-wrap gap-2">
      {TALLY.map((t) => {
        const n = counts.get(t.status) ?? 0;
        return (
          <div
            key={t.status}
            className={cn(
              "flex items-center gap-1.5 rounded-md border border-border px-2 py-1",
              !n && "opacity-40",
            )}
          >
            <StatusBadge status={t.status} />
            <span className="text-xs tabular-nums text-neutral-600">{n}</span>
          </div>
        );
      })}
    </div>
  );
};

const FeedRow = ({
  entry,
  selected,
  onSelect,
}: {
  entry: RunLogEntry;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) => {
  const [open, setOpen] = useState(false);
  const probes = entry.probes ?? [];
  const hasTx = probes.length > 0;
  const prefix = `${String(entry.seq)}#`;
  const selectedIdx =
    selected && selected.key.startsWith(prefix) ? Number(selected.key.slice(prefix.length)) : null;
  return (
    <div className="rounded-md border border-border">
      <div
        className={cn("flex items-center gap-2 px-2 py-1.5", hasTx && "cursor-pointer")}
        onClick={hasTx ? () => setOpen((o) => !o) : undefined}
      >
        {hasTx ? (
          <span className="text-neutral-500">
            {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
          </span>
        ) : (
          <span className="size-3.5" />
        )}
        <StatusBadge status={entry.status} />
        <span className="font-mono text-xs text-foreground">{entry.id}</span>
        <Badge tone={entry.kind === "canary" ? "accent" : "neutral"}>{entry.kind}</Badge>
        <span className="ml-auto text-xs tabular-nums text-neutral-500" title="self-consistency across phrasings">
          {entry.agreement.toFixed(2)}
        </span>
      </div>
      {entry.detail ? <div className="px-2 pb-1.5 text-xs text-neutral-600">{entry.detail}</div> : null}
      {open && hasTx ? (
        <div className="border-t border-border p-2">
          <Transcript
            probes={probes}
            selected={selectedIdx}
            onSelect={(i) => {
              const probe = probes[i];
              if (probe) onSelect({ key: `${prefix}${String(i)}`, title: entry.title || entry.id, probe });
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

const FeedList = ({
  log,
  selected,
  onSelect,
}: {
  log: RunLogEntry[];
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) => {
  const feed = [...log].reverse(); // newest first
  if (!feed.length) {
    return <div className="p-2 text-xs text-neutral-500">Waiting for the first topic to resolve…</div>;
  }
  return (
    <div className="flex flex-col gap-2">
      {feed.map((e) => (
        <FeedRow key={e.seq} entry={e} selected={selected} onSelect={onSelect} />
      ))}
    </div>
  );
};

/** The live instrument: progress, current topic, tally, feed, and a shared answer pane. */
const LiveFeed = ({ detail }: { detail: EvalRunDetail }) => {
  const { progress, log, status } = detail;
  const elapsed = useElapsed(detail.startedAt);
  const [sel, setSel] = useState<Selection | null>(null);
  const pct = progressPct(progress.done, progress.total);
  const heading =
    status === "running" ? `Probing ${detail.source.model}` : status === "paused" ? "Paused" : "Interrupted";

  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">
            {heading} · <span className="text-accent">{pct}%</span>
          </div>
          <div className="text-xs text-neutral-500">
            {progress.done}/{progress.total} topics · {elapsed} · {detail.manifestId}@{detail.manifestVersion}
            {detail.error ? ` · ${detail.error.message.split("\n")[0]}` : ""}
          </div>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full bg-accent" style={{ width: `${String(pct)}%` }} />
        </div>
        {status === "running" && progress.current ? (
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
            interrogating <b className="text-foreground">{progress.current.title || progress.current.id}</b>
            <Badge tone={progress.current.kind === "canary" ? "accent" : "neutral"}>
              {progress.current.kind}
            </Badge>
          </div>
        ) : null}
        <Tally log={log} />
        <FeedList log={log} selected={sel} onSelect={setSel} />
      </div>
      <div className="min-h-72 lg:h-full">
        <AnswerDetail selection={sel} />
      </div>
    </div>
  );
};

export default LiveFeed;

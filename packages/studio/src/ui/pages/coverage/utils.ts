import { pathKey } from "@/lib/derive";
import type { StatusBucket } from "@/lib/derive";
import type { CoverageSummary, TopicResult } from "@/services/types";

/** The dropdown label for one stored run. */
export const optionLabel = (r: CoverageSummary): string =>
  `${r.generatedAt || r.file} · ${r.source || "?"} · ${r.manifestId}@${r.manifestVersion}`;

/** Badge tone per status bucket — the fixed ok/caution/muted/alarm palette. */
export const BUCKET_TONE: Record<StatusBucket, "ok" | "caution" | "muted" | "alarm"> = {
  ok: "ok",
  caution: "caution",
  gap: "muted",
  alarm: "alarm",
};

export interface Group<T> {
  path: string[];
  items: T[];
}

/** Fold a path-sorted list into consecutive groups sharing the same `path`. */
export function groupByPath<T extends { path: string[] }>(rows: T[]): Group<T>[] {
  const out: Group<T>[] = [];
  for (const r of rows) {
    const last = out[out.length - 1];
    if (last && pathKey(last.path) === pathKey(r.path)) last.items.push(r);
    else out.push({ path: r.path, items: [r] });
  }
  return out;
}

/** Topics grouped by path — real before canary, then by id, for the per-topic table. */
export function groupResults(topics: TopicResult[]): Group<TopicResult>[] {
  const sorted = [...topics].sort(
    (a, b) =>
      pathKey(a.path).localeCompare(pathKey(b.path)) ||
      (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind === "real" ? -1 : 1),
  );
  return groupByPath(sorted);
}

import { pathKey } from "@/lib/derive";
import type { EvalEndpoint, RunRequest, TopicResult } from "@/services/types";

import type { IEndpointForm } from "./types";

export const progressPct = (done: number, total: number): number =>
  total ? Math.round((done / total) * 100) : 0;

/** An endpoint is runnable once it has an http(s) base, a model, and a key. */
export const endpointComplete = (e: IEndpointForm): boolean =>
  /^https?:\/\//i.test(e.baseUrl.trim()) && e.model.trim() !== "" && e.apiKey !== "";

/** Form → wire. Omits `temperature` entirely when blank/NaN (exactOptionalPropertyTypes). */
export function toWire(e: IEndpointForm): RunRequest["source"] {
  const base = {
    provider: e.provider,
    baseUrl: e.baseUrl.trim(),
    model: e.model.trim(),
    apiKey: e.apiKey,
  };
  const t = e.temperature.trim();
  if (t === "" || Number.isNaN(Number(t))) return base;
  return { ...base, temperature: Number(t) };
}

/** Prefill an endpoint block from a run's non-secret echo (key is never returned). */
export const fromEcho = (e: EvalEndpoint): IEndpointForm => ({
  provider: e.provider,
  baseUrl: e.baseUrl,
  model: e.model,
  apiKey: "",
  temperature: "",
});

/** Short age like "now" / "4m" / "2h" / "3d" from an ISO timestamp. */
export function relTime(iso: string): string {
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return "now";
  if (secs < 3600) return `${String(Math.floor(secs / 60))}m`;
  if (secs < 86400) return `${String(Math.floor(secs / 3600))}h`;
  return `${String(Math.floor(secs / 86400))}d`;
}

/** Group report rows into consecutive same-path runs (real before canary, then id). */
export function groupResults(topics: TopicResult[]): { path: string[]; topics: TopicResult[] }[] {
  const sorted = [...topics].sort(
    (a, b) =>
      pathKey(a.path).localeCompare(pathKey(b.path)) ||
      (a.kind === b.kind ? a.id.localeCompare(b.id) : a.kind === "real" ? -1 : 1),
  );
  const out: { path: string[]; topics: TopicResult[] }[] = [];
  for (const t of sorted) {
    const last = out[out.length - 1];
    if (last && pathKey(last.path) === pathKey(t.path)) last.topics.push(t);
    else out.push({ path: t.path, topics: [t] });
  }
  return out;
}

/** Best-effort message from a thrown error (ApiError extends Error, so `.message` is present). */
export const errMsg = (err: unknown): string => (err instanceof Error ? err.message : String(err));

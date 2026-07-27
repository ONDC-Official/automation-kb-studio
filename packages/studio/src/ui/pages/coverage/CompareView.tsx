import Badge from "@/components/Badge";
import StatusBadge from "@/components/StatusBadge";
import { metricDeltas, pathKey, pct, statusTransitions } from "@/lib/derive";
import type { Transition } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { CoverageReportWithTree } from "@/services/types";

import { BUCKET_TONE, groupByPath } from "./utils";

const ChangeGroup = ({ path, rows }: { path: string[]; rows: Transition[] }) => (
  <>
    <tr className="bg-neutral-100">
      <td colSpan={4} className="px-1 py-1 text-xs text-neutral-500">
        {path.join(" / ")}
      </td>
    </tr>
    {rows.map((tr) => (
      <tr key={tr.key} className="border-b border-border/50 align-top">
        <td className="py-1 font-mono text-xs">{tr.id}</td>
        <td className="py-1">{tr.title}</td>
        <td className="whitespace-nowrap py-1">
          <StatusBadge status={tr.from} /> <span className="text-neutral-400">→</span> <StatusBadge status={tr.to} />
        </td>
        <td className="py-1">
          <Badge tone={BUCKET_TONE[tr.bucket]}>{tr.note}</Badge>
        </td>
      </tr>
    ))}
  </>
);

/** Compare A (newer) vs B (older): metric deltas and per-topic status transitions. */
const CompareView = ({ newer, older }: { newer: CoverageReportWithTree; older: CoverageReportWithTree }) => {
  const mismatch = newer.manifestId !== older.manifestId || newer.manifestVersion !== older.manifestVersion;
  const deltas = metricDeltas(newer.metrics, older.metrics);
  const transitions = statusTransitions(newer, older);
  const groups = groupByPath(transitions);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto pr-1">
      {mismatch ? (
        <div className="rounded-md border border-warn/40 bg-warn/5 p-2 text-xs text-warn">
          Manifests differ ({older.manifestId}@{older.manifestVersion} → {newer.manifestId}@{newer.manifestVersion}) — the
          diff may be unreliable.
        </div>
      ) : null}
      <p className="text-xs text-neutral-600">
        Compare tracks <b>coverage &amp; faithfulness</b>, not correctness. A{" "}
        <code className="rounded bg-neutral-100 px-1">refused → grounded</code> flip is a coverage gain that could still
        be confidently wrong. Only a rising canary bite is a hard regression.
      </p>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {deltas.map((d) => {
          const sign = d.delta > 0 ? "+" : "";
          const tone = d.delta === 0 ? "text-neutral-500" : d.better ? "text-ok" : "text-error";
          return (
            <div key={d.def.key} className="flex flex-col gap-1 rounded-md border border-border bg-surface p-3">
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                {d.def.label}
                {d.regression ? <Badge tone="alarm">REGRESSION</Badge> : null}
              </div>
              <div className="text-2xl font-semibold tabular-nums text-foreground">{pct(d.now)}</div>
              <div className={cn("text-xs", tone)}>
                {sign}
                {Math.round(d.delta * 100)} pts vs baseline
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h6 className="mb-2 text-xs font-medium text-neutral-600">Topic status changes ({transitions.length})</h6>
        {transitions.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-neutral-500">
                <th className="font-medium">id</th>
                <th className="font-medium">title</th>
                <th className="font-medium">transition</th>
                <th className="font-medium">note</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <ChangeGroup key={pathKey(g.path)} path={g.path} rows={g.items} />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-sm text-neutral-500">No per-topic status changed between these two runs.</div>
        )}
      </div>
    </div>
  );
};

export default CompareView;

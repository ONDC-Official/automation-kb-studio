import Badge from "@/components/Badge";
import { pct, type MetricDef } from "@/lib/derive";
import type { Metrics } from "@/services/types";

/** A single headline gauge: label, big percentage, and a trace bar. Flags the canary alarm. */
const Gauge = ({ def, rate }: { def: MetricDef; rate: number }) => {
  const alarm = !!def.alarm && rate > 0;
  const trace = alarm ? "bg-error" : def.good === "up" ? "bg-ok" : "bg-warn";
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border bg-surface p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
        {def.label}
        {alarm && <Badge tone="alarm">ALARM</Badge>}
      </div>
      <div className="text-2xl font-semibold tabular-nums text-foreground">{pct(rate)}</div>
      <div className="h-1 overflow-hidden rounded-full bg-neutral-200">
        <i className={trace} style={{ display: "block", height: "100%", width: `${String(Math.round((rate || 0) * 100))}%` }} />
      </div>
    </div>
  );
};

/** The headline gauges for a report's metrics. */
export const Gauges = ({ metrics, defs }: { metrics: Metrics; defs: MetricDef[] }) => (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {defs.map((def) => (
      <Gauge key={def.key} def={def} rate={metrics[def.key]} />
    ))}
  </div>
);

export default Gauge;

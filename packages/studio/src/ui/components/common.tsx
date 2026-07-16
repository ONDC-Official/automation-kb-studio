/** Small shared presentational primitives: the health meter, status pill, gauge, and health tags. */
import type { CSSProperties } from "react";

import { pct, STATUS_CLASS, type HealthCounts, type MetricDef } from "../derive";
import type { Metrics, TopicStatus } from "../types";

const SEGMENTS: { key: keyof HealthCounts; cls: string }[] = [
  { key: "ok", cls: "m-ok" },
  { key: "caution", cls: "m-caution" },
  { key: "gap", cls: "m-gap" },
  { key: "alarm", cls: "m-alarm" },
  { key: "unknown", cls: "m-unknown" },
];

/** A stacked health meter. `width` sets an explicit CSS width (e.g. "110px"); default is full-width. */
export function Meter({ counts, width }: { counts: HealthCounts; width?: string }): React.JSX.Element {
  const total = counts.total || 1;
  const style: CSSProperties | undefined = width ? { width } : undefined;
  return (
    <div className="meter" style={style}>
      {SEGMENTS.map(({ key, cls }) =>
        counts[key] ? <i key={key} className={cls} style={{ width: `${String((counts[key] / total) * 100)}%` }} /> : null,
      )}
    </div>
  );
}

/** Compact "N ok · N gap · N BIT" summary tags for a set of counts (only when coverage is present). */
export function HealthTags({ counts, hasCoverage }: { counts: HealthCounts; hasCoverage: boolean }): React.JSX.Element {
  if (!hasCoverage) return <span>{counts.total} topics</span>;
  const bits: React.JSX.Element[] = [];
  if (counts.ok) bits.push(<span key="ok"><b>{counts.ok}</b> ok</span>);
  if (counts.caution) bits.push(<span key="caution"><b>{counts.caution}</b> caution</span>);
  if (counts.gap) bits.push(<span key="gap"><b>{counts.gap}</b> gap</span>);
  if (counts.alarm) bits.push(<span key="alarm" className="bit"><b>{counts.alarm}</b> BIT</span>);
  return <>{bits.length ? bits : <span>{counts.total} topics</span>}</>;
}

export function StatusPill({ status }: { status: TopicStatus }): React.JSX.Element {
  return <span className={`pill ${STATUS_CLASS[status]}`}>{status}</span>;
}

/** A single headline gauge: label, big percentage, and a trace bar. Flags the canary alarm. */
export function Gauge({ def, rate }: { def: MetricDef; rate: number }): React.JSX.Element {
  const alarm = !!def.alarm && rate > 0;
  const trace = alarm ? "t-alarm" : def.good === "up" ? "t-ok" : "t-warn";
  return (
    <div className="gauge">
      <div className="g-label">
        {def.label}
        {alarm ? <span className="pill s-alarm">ALARM</span> : null}
      </div>
      <div className="g-num">{pct(rate)}</div>
      <div className="trace">
        <i className={trace} style={{ width: `${String(Math.round((rate || 0) * 100))}%` }} />
      </div>
    </div>
  );
}

/** The four headline gauges for a report's metrics. */
export function Gauges({ metrics, defs }: { metrics: Metrics; defs: MetricDef[] }): React.JSX.Element {
  return (
    <div className="gauges">
      {defs.map((def) => (
        <Gauge key={def.key} def={def} rate={metrics[def.key]} />
      ))}
    </div>
  );
}

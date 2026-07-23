/** Small shared presentational primitives: the health meter, status pill, gauge, and health tags. */
import type { CSSProperties } from "react";

import { pct, STATUS_CLASS, type HealthCounts, type MetricDef } from "../derive";
import type { Metrics, TopicProbe, TopicStatus } from "../types";

const SEGMENTS: { key: keyof HealthCounts; cls: string }[] = [
  { key: "ok", cls: "m-ok" },
  { key: "caution", cls: "m-caution" },
  { key: "gap", cls: "m-gap" },
  { key: "alarm", cls: "m-alarm" },
  { key: "unknown", cls: "m-unknown" },
];

/** Shared disclosure caret: a crisp CSS-drawn triangle (not a tiny glyph) that rotates when open. */
export function Caret({ open }: { open: boolean }): React.JSX.Element {
  return <span className={`caret${open ? " open" : ""}`} aria-hidden="true" />;
}

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
  // No fallback "N topics": every caller shows the total in an adjacent count element, so a fallback here just duplicates it (and overflows the rail).
  return <>{bits}</>;
}

export function StatusPill({ status }: { status: TopicStatus }): React.JSX.Element {
  return <span className={`pill ${STATUS_CLASS[status]}`}>{status}</span>;
}

/** The verdict pills for one probe — reused in the question list and the detail-pane header. */
export function ProbeVerdict({ p }: { p: TopicProbe }): React.JSX.Element {
  return (
    <div className="tx-v">
      <span className={`pill ${p.responsive ? "s-ok" : "s-muted"}`}>{p.responsive ? "responsive" : "not responsive"}</span>
      <span className="pill s-none">specificity: {p.specificity}</span>
    </div>
  );
}

/**
 * The per-phrasing question list: click a question to load its full response into the detail pane.
 * `selected` marks the active question; `onSelect` reports a click. Answers are NOT shown here —
 * they render as markdown in the sticky detail pane.
 */
export function Transcript({
  probes,
  selected,
  onSelect,
}: {
  probes: TopicProbe[];
  selected: number | null;
  onSelect: (i: number) => void;
}): React.JSX.Element {
  return (
    <div className="transcript">
      {probes.map((p, i) => (
        <button
          type="button"
          className={`tx-item${selected === i ? " sel" : ""}`}
          key={i}
          onClick={() => onSelect(i)}
        >
          <div className="tx-q">
            <span className="tx-tag">Q{probes.length > 1 ? String(i + 1) : ""}</span> {p.question}
          </div>
          <ProbeVerdict p={p} />
        </button>
      ))}
    </div>
  );
}

/** The question whose full answer the sticky detail pane shows. Shared by the report and live feed. */
export interface Selection {
  key: string;
  title: string;
  probe: TopicProbe;
}

/**
 * The sticky right-hand pane: the full response to the selected question, rendered as markdown.
 * Used by both the coverage report and the live/stopped run feed so the two-pane frame is identical.
 */
export function AnswerDetail({ selection }: { selection: Selection | null }): React.JSX.Element {
  return (
    <aside className="report-detail">
      {selection ? (
        <>
          <div className="rd-head">
            <div className="rd-q">{selection.probe.question}</div>
            <div className="rd-topic">{selection.title}</div>
            <ProbeVerdict p={selection.probe} />
          </div>
          <div className="rd-body">
            {selection.probe.refused ? (
              <em>(no answer — the source reported no result)</em>
            ) : (
              <Markdown text={selection.probe.answer} />
            )}
          </div>
        </>
      ) : (
        <div className="rd-empty">Click a question to read its full response here.</div>
      )}
    </aside>
  );
}

// ponytail: minimal markdown — headings, bold/italic/code, links, lists, blockquote, fenced code.
// No tables/nested lists; swap in marked+DOMPurify if answers start needing them. No raw HTML, so
// there is no injection surface even when the source answer is untrusted.
function inlineMd(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0] ?? "";
    const key = `${keyBase}-${String(k++)}`;
    if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      const href = link?.[2] ?? "";
      // Only follow safe schemes; anything else renders as plain text (no javascript: URLs).
      if (link && /^(https?:|\/|#|mailto:)/i.test(href))
        out.push(
          <a key={key} href={href} target="_blank" rel="noreferrer noopener">
            {link[1] ?? ""}
          </a>,
        );
      else out.push(tok);
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ text }: { text: string }): React.JSX.Element {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  const isBlockStart = (l: string): boolean => /^(```|#{1,6}\s|>\s?|\s*[-*+]\s+|\s*\d+\.\s+)/.test(l);
  const at = (n: number): string => lines[n] ?? "";
  while (i < lines.length) {
    const line = at(i);
    const key = `b${String(blocks.length)}`;
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(at(i))) buf.push(at(i++));
      i++; // closing fence
      blocks.push(
        <pre key={key}>
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min((h[1] ?? "").length + 2, 6);
      const Tag = `h${String(level)}` as "h3" | "h4" | "h5" | "h6";
      blocks.push(<Tag key={key}>{inlineMd(h[2] ?? "", key)}</Tag>);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(at(i))) buf.push(at(i++).replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key}>{inlineMd(buf.join(" "), key)}</blockquote>);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(at(i)))
        items.push(<li key={items.length}>{inlineMd(at(i++).replace(/^\s*[-*+]\s+/, ""), `${key}-${String(items.length)}`)}</li>);
      blocks.push(<ul key={key}>{items}</ul>);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(at(i)))
        items.push(<li key={items.length}>{inlineMd(at(i++).replace(/^\s*\d+\.\s+/, ""), `${key}-${String(items.length)}`)}</li>);
      blocks.push(<ol key={key}>{items}</ol>);
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && at(i).trim() && !isBlockStart(at(i))) buf.push(at(i++));
    blocks.push(<p key={key}>{inlineMd(buf.join(" "), key)}</p>);
  }
  return <div className="md">{blocks}</div>;
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

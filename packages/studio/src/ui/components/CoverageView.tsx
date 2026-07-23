/**
 * CoverageView — the read-only instrument panel. A run picker (A, plus an optional B for compare).
 *
 *   Single report: a canary-bite banner (a pure-CSS CMYK-misregistration number treatment) when the
 *   canary bite rate is above zero, totals, four headline gauges, the per-level drill-down
 *   (CoverageTreeGauges), a per-topic table grouped by path, and a caveats/judge-warning note.
 *
 *   Compare (A vs B): metric deltas (▲/▼ points, a rising canary-bite flagged as a REGRESSION) and
 *   per-topic status transitions joined by `topicKey`, grouped by path. Framed as tracking coverage &
 *   faithfulness, NOT correctness.
 */
import { useLayoutEffect, useRef, useState, type Dispatch } from "react";

import {
  METRICS,
  metricDeltas,
  pathKey,
  pct,
  statusTransitions,
  STATUS_CLASS,
} from "../derive";
import type { Action } from "../state";
import type { CoverageReportWithTree, CoverageSummary, TopicResult } from "../types";
import { CoverageTreeGauges } from "./CoverageTree";
import { AnswerDetail, Caret, Gauges, StatusPill, Transcript, type Selection } from "./common";

function groupResults(topics: TopicResult[]): { path: string[]; topics: TopicResult[] }[] {
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

function BiteNumber({ text }: { text: string }): React.JSX.Element {
  return (
    <div className="cmyk-num" aria-label={text}>
      <span className="paper">{text}</span>
      <span className="plate plate-c" aria-hidden="true">
        {text}
      </span>
      <span className="plate plate-m" aria-hidden="true">
        {text}
      </span>
      <span className="plate plate-y" aria-hidden="true">
        {text}
      </span>
    </div>
  );
}

function Footer({ report }: { report: CoverageReportWithTree }): React.JSX.Element {
  return (
    <div className="foot">
      {report.judge && !report.judge.schemaEnforced ? (
        <div className="banner warn">Judge schema NOT enforced — verdicts ran blind, so read them with suspicion.</div>
      ) : null}
      <b>Caveats.</b>{" "}
      Without ground truth, "grounded" means self-consistent and refused-when-fabricated — not correct. The canary
      bite-rate survives a weak judge; agreement scores below 0.6 ran on a heuristic fallback.
      {report.caveats.length ? (
        <ul>
          {report.caveats.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : null}
      {report.judge.warnings.length ? (
        <>
          <b>Judge warnings</b>
          <ul>
            {report.judge.warnings.map((w, i) => (
              <li key={i}>⚠ {w}</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export function SingleReport({ report, levels }: { report: CoverageReportWithTree; levels: string[] }): React.JSX.Element {
  const { metrics: m, totals: t } = report;
  const [selected, setSelected] = useState<Selection | null>(null);
  return (
    <div className="report-split">
      <div className="report-main">
      {m.canaryBiteRate > 0 ? (
        <div className="bite-banner">
          <BiteNumber text={pct(m.canaryBiteRate)} />
          <div>
            <h4>Canary bite</h4>
            <p>
              The source confidently answered a <b>fabricated</b> topic a grounded source would refuse. Its confident
              answers elsewhere are suspect.
            </p>
          </div>
        </div>
      ) : null}

      <div className="totals">
        <span>
          <b>{t.topics}</b> topics
        </span>
        <span>
          <b>{t.real}</b> real
        </span>
        <span>
          <b>{t.canary}</b> canary
        </span>
        <span>
          source <b>{report.source || "?"}</b>
        </span>
        <span style={{ color: "var(--color-neutral-500)" }}>{report.generatedAt ?? ""}</span>
      </div>

      <Gauges metrics={m} defs={METRICS} />

      {report.tree ? <CoverageTreeGauges tree={report.tree} levels={levels} /> : null}

      <h6 style={{ color: "var(--color-neutral-600)", margin: "0 0 10px" }}>Per-topic detail</h6>
      <table className="table" style={{ marginBottom: 22 }}>
        <thead>
          <tr>
            <th>id</th>
            <th>title / sample</th>
            <th>kind</th>
            <th>status / detail</th>
            <th style={{ textAlign: "right" }}>agree</th>
          </tr>
        </thead>
        <tbody>
          {groupResults(report.topics).map((g) => (
            <ReportGroup key={pathKey(g.path)} path={g.path} topics={g.topics} selected={selected} onSelect={setSelected} />
          ))}
        </tbody>
      </table>

      <Footer report={report} />
      </div>

      <AnswerDetail selection={selected} />
    </div>
  );
}

function ReportGroup({
  path,
  topics,
  selected,
  onSelect,
}: {
  path: string[];
  topics: TopicResult[];
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}): React.JSX.Element {
  return (
    <>
      <tr className="area-sep">
        <td colSpan={5}>
          {path.join(" / ")} · {topics.length}
        </td>
      </tr>
      {topics.map((tp) => (
        <ReportRow key={tp.key} tp={tp} selected={selected} onSelect={onSelect} />
      ))}
    </>
  );
}

/** One topic row; click to expand its questions, then click a question to load its answer into the detail pane. */
function ReportRow({
  tp,
  selected,
  onSelect,
}: {
  tp: TopicResult;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const probes = tp.probes ?? [];
  const hasTx = probes.length > 0;
  const selectedIdx = selected && selected.key.startsWith(`${tp.key}#`) ? Number(selected.key.slice(`${tp.key}#`.length)) : null;
  return (
    <>
      <tr className={hasTx ? "tx-toggle" : undefined} onClick={hasTx ? () => setOpen((o) => !o) : undefined} title={hasTx ? "Show the questions asked; click one to read its full response" : undefined}>
        <td>
          <span className="c-id">
            {hasTx ? <span className="tx-caret"><Caret open={open} /></span> : null}
            {tp.id}
          </span>
        </td>
        <td>
          {tp.title}
          {tp.sample ? <div className="c-sample">{tp.sample}</div> : null}
        </td>
        <td>
          <span className={`r-kind ${tp.kind}`}>{tp.kind}</span>
        </td>
        <td>
          <StatusPill status={tp.status} />
          {tp.detail ? <div className="c-sample">{tp.detail}</div> : null}
        </td>
        <td className="agree">{tp.agreement.toFixed(2)}</td>
      </tr>
      {open && hasTx ? (
        <tr className="tx-row">
          <td colSpan={5}>
            <Transcript
              probes={probes}
              selected={selectedIdx}
              onSelect={(i) => {
                const probe = probes[i];
                if (probe) onSelect({ key: `${tp.key}#${String(i)}`, title: tp.title, probe });
              }}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function Compare({ newer, older }: { newer: CoverageReportWithTree; older: CoverageReportWithTree }): React.JSX.Element {
  const mismatch = newer.manifestId !== older.manifestId || newer.manifestVersion !== older.manifestVersion;
  const deltas = metricDeltas(newer.metrics, older.metrics);
  const transitions = statusTransitions(newer, older);

  // Group transitions by path for the breadcrumb-separated table.
  const groups: { path: string[]; rows: typeof transitions }[] = [];
  for (const tr of transitions) {
    const last = groups[groups.length - 1];
    if (last && pathKey(last.path) === pathKey(tr.path)) last.rows.push(tr);
    else groups.push({ path: tr.path, rows: [tr] });
  }

  return (
    <>
      {mismatch ? (
        <div className="banner warn">
          Manifests differ ({older.manifestId}@{older.manifestVersion} → {newer.manifestId}@{newer.manifestVersion}) — the
          diff may be unreliable.
        </div>
      ) : null}
      <div className="caption">
        Compare tracks <b>coverage &amp; faithfulness</b>, not correctness. A <code>refused → grounded</code> flip is a
        coverage gain that could still be confidently wrong — only ground truth (not yet built) settles correctness.
        Only a rising canary bite is a hard regression.
      </div>

      <div className="gauges">
        {deltas.map((d) => {
          const cls = d.delta === 0 ? "flat" : `${d.delta > 0 ? "up" : "down"}-${d.better ? "good" : "bad"}`;
          const sign = d.delta > 0 ? "+" : "";
          return (
            <div className="gauge" key={d.def.key}>
              <div className="g-label">
                {d.def.label}
                {d.regression ? <span className="pill s-alarm">REGRESSION</span> : null}
              </div>
              <div className="g-num">{pct(d.now)}</div>
              <div className={`g-delta ${cls}`}>
                {sign}
                {Math.round(d.delta * 100)} pts vs baseline
              </div>
            </div>
          );
        })}
      </div>

      <h6 style={{ color: "var(--color-neutral-600)", margin: "0 0 10px" }}>Topic status changes ({transitions.length})</h6>
      {transitions.length ? (
        <table className="table">
          <thead>
            <tr>
              <th>id</th>
              <th>title</th>
              <th>transition</th>
              <th>note</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <ChangeGroup key={pathKey(g.path)} path={g.path} rows={g.rows} />
            ))}
          </tbody>
        </table>
      ) : (
        <div className="hint">No per-topic status changed between these two runs.</div>
      )}
    </>
  );
}

function ChangeGroup({
  path,
  rows,
}: {
  path: string[];
  rows: ReturnType<typeof statusTransitions>;
}): React.JSX.Element {
  return (
    <>
      <tr className="area-sep">
        <td colSpan={4}>{path.join(" / ")}</td>
      </tr>
      {rows.map((tr) => (
        <tr key={tr.key}>
          <td>
            <span className="c-id">{tr.id}</span>
          </td>
          <td>{tr.title}</td>
          <td style={{ whiteSpace: "nowrap" }}>
            <span className={`pill ${STATUS_CLASS[tr.from]}`}>{tr.from}</span>{" "}
            <span style={{ color: "var(--color-neutral-400)" }}>→</span>{" "}
            <span className={`pill ${STATUS_CLASS[tr.to]}`}>{tr.to}</span>
          </td>
          <td>
            <span className={`pill ${tr.cls}`}>{tr.note}</span>
          </td>
        </tr>
      ))}
    </>
  );
}

export function CoverageView(props: {
  runs: CoverageSummary[];
  runA: string | null;
  runB: string | null;
  reports: Record<string, CoverageReportWithTree>;
  levels: string[];
  dispatch: Dispatch<Action>;
}): React.JSX.Element {
  const { runs, runA, runB, reports, levels, dispatch } = props;

  // Measure the sticky toolbar's live height so the sticky detail pane pins exactly beneath it
  // (the toolbar wraps to two rows on narrow widths). Same pattern as TopicList's `--toolbar-h`.
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarH, setToolbarH] = useState(64);
  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;
    const measure = (): void => setToolbarH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const optionLabel = (r: CoverageSummary): string =>
    `${r.generatedAt || r.file} · ${r.source || "?"} · ${r.manifestId}@${r.manifestVersion}`;

  if (!runs.length) {
    return (
      <section className="view">
        <div className="cov-wrap">
          <div className="empty">
            <div className="big">No coverage runs yet</div>
            Run <code>npm run dev -- --coverage kb</code>, then reload.
          </div>
        </div>
      </section>
    );
  }

  const reportA = runA ? reports[runA] : undefined;
  const reportB = runB ? reports[runB] : undefined;
  const comparing = !!runB && runB !== runA;

  return (
    <section className="view" style={{ "--toolbar-h": `${String(toolbarH)}px` } as React.CSSProperties}>
      <div className="toolbar" ref={toolbarRef}>
        <div className="field">
          <label>Run</label>
          <select
            className="run"
            value={runA ?? ""}
            onChange={(e) => dispatch({ type: "selectRun", slot: "a", file: e.target.value || null })}
          >
            {runs.map((r) => (
              <option key={r.file} value={r.file}>
                {optionLabel(r)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Compare against</label>
          <select
            className="run"
            value={runB ?? ""}
            onChange={(e) => dispatch({ type: "selectRun", slot: "b", file: e.target.value || null })}
          >
            <option value="">— none (single run) —</option>
            {runs.map((r) => (
              <option key={r.file} value={r.file}>
                {optionLabel(r)}
              </option>
            ))}
          </select>
        </div>
        <div className="spacer" />
      </div>

      <div className="cov-wrap">
        {comparing ? (
          reportA && reportB ? (
            <Compare newer={reportA} older={reportB} />
          ) : (
            <div className="empty">Loading reports…</div>
          )
        ) : reportA ? (
          <SingleReport report={reportA} levels={levels} />
        ) : (
          <div className="empty">Loading report…</div>
        )}
      </div>
    </section>
  );
}

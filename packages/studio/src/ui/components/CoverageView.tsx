/**
 * CoverageView — the read-only instrument panel. A run picker (A, plus an optional B for compare).
 *
 *   Single report: four headline gauges (grounded/refused/inconsistent + a prominent CANARY-BITE
 *   alarm), caveats, judge warnings, the per-level drill-down (CoverageTreeGauges), and a per-topic
 *   table grouped by path.
 *
 *   Compare (A vs B): metric deltas (▲/▼ points, a rising canary-bite flagged as a REGRESSION) and
 *   per-topic status transitions joined by `topicKey`, grouped by path. Framed as tracking coverage &
 *   faithfulness, NOT correctness.
 */
import type { Dispatch } from "react";

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
import { Gauges, StatusPill } from "./common";

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

function Footer({ report }: { report: CoverageReportWithTree }): React.JSX.Element {
  return (
    <div className="foot">
      {report.judge && !report.judge.schemaEnforced ? (
        <div className="banner warn">Judge schema NOT enforced — verdicts ran blind, so read them with suspicion.</div>
      ) : null}
      <b>Caveats</b>
      <ul>{report.caveats.map((c, i) => <li key={i}>{c}</li>)}</ul>
      {report.judge.warnings.length ? (
        <>
          <b>Judge warnings</b>
          <ul>{report.judge.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}</ul>
        </>
      ) : null}
    </div>
  );
}

function SingleReport({ report }: { report: CoverageReportWithTree }): React.JSX.Element {
  const { metrics: m, totals: t } = report;
  return (
    <>
      <div className="card">
        {m.canaryBiteRate > 0 ? (
          <div className="banner alarm">
            ⚠ CANARY BITE {pct(m.canaryBiteRate)} — the source confidently answered a fabricated topic. Its confident
            answers elsewhere are suspect.
          </div>
        ) : null}
        <div className="totals">
          <span><b>{t.topics}</b> topics</span>
          <span><b>{t.real}</b> real</span>
          <span><b>{t.canary}</b> canary</span>
          <span>source <b>{report.source || "?"}</b></span>
          <span>{report.generatedAt ?? ""}</span>
        </div>
        <Gauges metrics={m} defs={METRICS} />
      </div>

      {report.tree ? <CoverageTreeGauges tree={report.tree} /> : null}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>title / sample</th>
              <th>kind</th>
              <th>status / detail</th>
              <th>agree</th>
            </tr>
          </thead>
          <tbody>
            {groupResults(report.topics).map((g) => (
              <ReportGroup key={pathKey(g.path)} path={g.path} topics={g.topics} />
            ))}
          </tbody>
        </table>
        <Footer report={report} />
      </div>
    </>
  );
}

function ReportGroup({ path, topics }: { path: string[]; topics: TopicResult[] }): React.JSX.Element {
  return (
    <>
      <tr className="area-sep">
        <td colSpan={5}>
          {path.join(" / ")} · {topics.length}
        </td>
      </tr>
      {topics.map((tp) => (
        <tr key={tp.key}>
          <td>
            <span className="c-id">{tp.id}</span>
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
      ))}
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
      <div className="card">
        {mismatch ? (
          <div className="banner warn">
            Manifests differ ({older.manifestId}@{older.manifestVersion} → {newer.manifestId}@{newer.manifestVersion}) —
            the diff may be unreliable.
          </div>
        ) : null}
        <div className="caption">
          Compare tracks <b>coverage &amp; faithfulness</b>, not correctness. A <code>refused → grounded</code> flip is a
          coverage gain that could still be confidently wrong — only ground truth (not yet built) settles correctness.
          Only a rising canary-bite is a hard regression.
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
      </div>

      <div className="card">
        <label style={{ margin: "0 0 10px" }}>Topic status changes ({transitions.length})</label>
        {transitions.length ? (
          <table>
            <thead>
              <tr>
                <th>id</th>
                <th>title</th>
                <th>transition</th>
                <th />
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
      </div>
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
          <td>
            <span className={`pill ${STATUS_CLASS[tr.from]}`}>{tr.from}</span> →{" "}
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
  dispatch: Dispatch<Action>;
}): React.JSX.Element {
  const { runs, runA, runB, reports, dispatch } = props;

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
    <section className="view">
      <div className="toolbar">
        <div>
          <label style={{ margin: "0 0 4px" }}>Run</label>
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
        <div>
          <label style={{ margin: "0 0 4px" }}>Compare against</label>
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
          <SingleReport report={reportA} />
        ) : (
          <div className="empty">Loading report…</div>
        )}
      </div>
    </section>
  );
}

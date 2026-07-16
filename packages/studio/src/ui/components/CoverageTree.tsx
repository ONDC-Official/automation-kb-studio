/**
 * CoverageTreeGauges — the per-level drill-down for a single report, fed by its `tree` (`CoverageNode`).
 * Every node shows its subtree totals and the four rates, and expands to its children, so you can read
 * coverage down a ragged path: "retail 80% grounded → retail 1.2.0 60% → retail 1.2.0 search: gap".
 */
import { useState } from "react";

import { METRICS, pathKey, pct } from "../derive";
import type { CoverageNode } from "../types";

function Rates({ node }: { node: CoverageNode }): React.JSX.Element {
  return (
    <span className="ct-rates">
      {METRICS.map((m) => {
        const rate = node.metrics[m.key];
        const alarm = !!m.alarm && rate > 0;
        return (
          <span key={m.key} className={`ct-rate${alarm ? " bit" : ""}`}>
            <span className="ct-rlabel">{m.label}</span>
            <b>{pct(rate)}</b>
          </span>
        );
      })}
    </span>
  );
}

function TreeRow({ node, depth }: { node: CoverageNode; depth: number }): React.JSX.Element {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  return (
    <>
      <div className="ct-row" style={{ paddingLeft: 8 + depth * 16 }}>
        {hasChildren ? (
          <button className="mini tw" type="button" onClick={() => setOpen(!open)} title={open ? "Collapse" : "Expand"}>
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="tw-spacer" />
        )}
        <span className="ct-name">{node.segment || "all"}</span>
        <span className="ct-totals">
          {node.totals.topics} · <b>{node.totals.real}</b> real · <b>{node.totals.canary}</b> canary
        </span>
        <Rates node={node} />
      </div>
      {open && hasChildren
        ? node.children.map((c) => <TreeRow key={pathKey(c.path)} node={c} depth={depth + 1} />)
        : null}
    </>
  );
}

export function CoverageTreeGauges({ tree }: { tree: CoverageNode }): React.JSX.Element {
  return (
    <div className="card">
      <label style={{ margin: "0 0 10px" }}>Per-level coverage</label>
      <div className="ct">
        {tree.children.length ? (
          tree.children.map((c) => <TreeRow key={pathKey(c.path)} node={c} depth={0} />)
        ) : (
          <div className="hint">No taxonomy nodes in this report.</div>
        )}
      </div>
    </div>
  );
}

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Gauges } from "@/components/Gauge";
import StatusBadge from "@/components/StatusBadge";
import { AnswerDetail, Transcript } from "@/components/Transcript";
import type { Selection } from "@/components/Transcript";
import { METRICS, pathKey, pct } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { CoverageReportWithTree, TopicResult } from "@/services/types";

import CoverageTree from "./CoverageTree";
import { groupResults } from "./utils";

interface IProps {
  report: CoverageReportWithTree;
  levels: string[];
  selection: Selection | null;
  onSelect: (s: Selection | null) => void;
}

/** One topic row; click to expand its probes, then a probe to load its answer into the detail pane. */
const ReportRow = ({
  tp,
  selection,
  onSelect,
}: {
  tp: TopicResult;
  selection: Selection | null;
  onSelect: (s: Selection | null) => void;
}) => {
  const [open, setOpen] = useState(false);
  const probes = tp.probes ?? [];
  const hasTx = probes.length > 0;
  const prefix = `${tp.key}#`;
  const selectedIdx = selection && selection.key.startsWith(prefix) ? Number(selection.key.slice(prefix.length)) : null;
  const Caret = open ? ChevronDown : ChevronRight;
  return (
    <>
      <tr
        className={cn("border-b border-border/50 align-top", hasTx && "cursor-pointer hover:bg-neutral-100")}
        onClick={hasTx ? () => setOpen((o) => !o) : undefined}
      >
        <td className="py-1">
          <span className="flex items-center gap-1 font-mono text-xs">
            {hasTx ? <Caret className="size-3 text-neutral-500" /> : null}
            {tp.id}
          </span>
        </td>
        <td className="py-1">
          {tp.title}
          {tp.sample ? <div className="text-xs text-neutral-500">{tp.sample}</div> : null}
        </td>
        <td className="py-1">
          <span className="text-xs text-neutral-600">{tp.kind}</span>
        </td>
        <td className="py-1">
          <StatusBadge status={tp.status} />
          {tp.detail ? <div className="text-xs text-neutral-500">{tp.detail}</div> : null}
        </td>
        <td className="py-1 text-right tabular-nums">{tp.agreement.toFixed(2)}</td>
      </tr>
      {open && hasTx ? (
        <tr className="border-b border-border/50">
          <td colSpan={5} className="p-2">
            <Transcript
              probes={probes}
              selected={selectedIdx}
              onSelect={(i) => {
                const probe = probes[i];
                if (probe) onSelect({ key: `${prefix}${String(i)}`, title: tp.title, probe });
              }}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
};

const ReportGroup = ({
  path,
  topics,
  selection,
  onSelect,
}: {
  path: string[];
  topics: TopicResult[];
  selection: Selection | null;
  onSelect: (s: Selection | null) => void;
}) => (
  <>
    <tr className="bg-neutral-100">
      <td colSpan={5} className="px-1 py-1 text-xs text-neutral-500">
        {path.join(" / ")} · {topics.length}
      </td>
    </tr>
    {topics.map((tp) => (
      <ReportRow key={tp.key} tp={tp} selection={selection} onSelect={onSelect} />
    ))}
  </>
);

const Footer = ({ report }: { report: CoverageReportWithTree }) => (
  <div className="flex flex-col gap-2 border-t border-border pt-3 text-xs text-neutral-600">
    {!report.judge.schemaEnforced ? (
      <div className="rounded-md border border-warn/40 bg-warn/5 p-2 text-warn">
        Judge schema NOT enforced — verdicts ran blind, so read them with suspicion.
      </div>
    ) : null}
    <p>
      <b className="text-foreground">Caveats.</b> Without ground truth, "grounded" means self-consistent and
      refused-when-fabricated — not correct. The canary bite-rate survives a weak judge; agreement scores below 0.6 ran
      on a heuristic fallback.
    </p>
    {report.caveats.length ? (
      <ul className="list-disc pl-5">
        {report.caveats.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    ) : null}
    {report.judge.warnings.length ? (
      <>
        <b className="text-foreground">Judge warnings</b>
        <ul className="list-disc pl-5">
          {report.judge.warnings.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      </>
    ) : null}
  </div>
);

/** A single report: headline gauges, per-level tree, per-topic table, and the sticky answer pane. */
const ReportView = ({ report, levels, selection, onSelect }: IProps) => {
  const { metrics: m, totals: t } = report;
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_360px] gap-4 overflow-hidden">
      <div className="flex flex-col gap-4 overflow-auto pr-1">
        {m.canaryBiteRate > 0 ? (
          <div className="flex items-center gap-3 rounded-md border border-error/40 bg-error/5 p-3">
            <div className="text-3xl font-bold tabular-nums text-error">{pct(m.canaryBiteRate)}</div>
            <div>
              <div className="font-semibold text-error">Canary bite</div>
              <p className="text-xs text-neutral-600">
                The source confidently answered a fabricated topic a grounded source would refuse. Its confident answers
                elsewhere are suspect.
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>
            <b className="text-foreground">{t.topics}</b> topics
          </span>
          <span>
            <b className="text-foreground">{t.real}</b> real
          </span>
          <span>
            <b className="text-foreground">{t.canary}</b> canary
          </span>
          <span>
            source <b className="text-foreground">{report.source || "?"}</b>
          </span>
          {report.generatedAt ? <span className="text-neutral-500">{report.generatedAt}</span> : null}
        </div>

        <Gauges metrics={m} defs={METRICS} />

        {report.tree ? <CoverageTree tree={report.tree} levels={levels} /> : null}

        <div>
          <h6 className="mb-2 text-xs font-medium text-neutral-600">Per-topic detail</h6>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-neutral-500">
                <th className="font-medium">id</th>
                <th className="font-medium">title / sample</th>
                <th className="font-medium">kind</th>
                <th className="font-medium">status / detail</th>
                <th className="text-right font-medium">agree</th>
              </tr>
            </thead>
            <tbody>
              {groupResults(report.topics).map((g) => (
                <ReportGroup
                  key={pathKey(g.path)}
                  path={g.path}
                  topics={g.items}
                  selection={selection}
                  onSelect={onSelect}
                />
              ))}
            </tbody>
          </table>
        </div>

        <Footer report={report} />
      </div>

      <AnswerDetail selection={selection} />
    </div>
  );
};

export default ReportView;

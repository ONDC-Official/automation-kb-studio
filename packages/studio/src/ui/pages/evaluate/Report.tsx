import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";

import Badge from "@/components/Badge";
import { Gauges } from "@/components/Gauge";
import StatusBadge from "@/components/StatusBadge";
import { AnswerDetail, Transcript, type Selection } from "@/components/Transcript";
import { METRICS, pct } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { CoverageReportWithTree, TopicResult } from "@/services/types";

import { groupResults } from "./utils";

const ReportRow = ({
  tp,
  selected,
  onSelect,
}: {
  tp: TopicResult;
  selected: Selection | null;
  onSelect: (s: Selection) => void;
}) => {
  const [open, setOpen] = useState(false);
  const probes = tp.probes ?? [];
  const hasTx = probes.length > 0;
  const prefix = `${tp.key}#`;
  const selectedIdx =
    selected && selected.key.startsWith(prefix) ? Number(selected.key.slice(prefix.length)) : null;
  return (
    <>
      <tr
        className={cn("border-b border-border align-top", hasTx && "cursor-pointer")}
        onClick={hasTx ? () => setOpen((o) => !o) : undefined}
      >
        <td className="py-1.5 pr-2">
          <span className="flex items-center gap-1 font-mono text-xs">
            {hasTx ? (
              open ? (
                <ChevronDown className="size-3.5 text-neutral-500" />
              ) : (
                <ChevronRight className="size-3.5 text-neutral-500" />
              )
            ) : (
              <span className="size-3.5" />
            )}
            {tp.id}
          </span>
        </td>
        <td className="py-1.5 pr-2 text-sm">
          {tp.title}
          {tp.sample ? <div className="text-xs text-neutral-500">{tp.sample}</div> : null}
        </td>
        <td className="py-1.5 pr-2">
          <Badge tone={tp.kind === "canary" ? "accent" : "neutral"}>{tp.kind}</Badge>
        </td>
        <td className="py-1.5 pr-2">
          <StatusBadge status={tp.status} />
          {tp.detail ? <div className="text-xs text-neutral-500">{tp.detail}</div> : null}
        </td>
        <td className="py-1.5 text-right text-xs tabular-nums">{tp.agreement.toFixed(2)}</td>
      </tr>
      {open && hasTx ? (
        <tr className="border-b border-border">
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

/** The finished-run report: headline gauges, totals, a per-topic table, and a shared answer pane. */
const Report = ({ report }: { report: CoverageReportWithTree }) => {
  const { metrics: m, totals: t } = report;
  const [selected, setSelected] = useState<Selection | null>(null);
  return (
    <div className="grid min-h-0 gap-4 lg:grid-cols-[1fr_360px]">
      <div className="flex min-w-0 flex-col gap-4">
        {m.canaryBiteRate > 0 ? (
          <div className="rounded-md border border-error/40 bg-error/10 p-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-error">{pct(m.canaryBiteRate)}</span>
              <b className="text-sm text-foreground">Canary bite</b>
            </div>
            <p className="mt-1 text-xs text-neutral-600">
              The source confidently answered a <b>fabricated</b> topic a grounded source would refuse. Its
              confident answers elsewhere are suspect.
            </p>
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
          <span className="text-neutral-500">{report.generatedAt ?? ""}</span>
        </div>

        <Gauges metrics={m} defs={METRICS} />

        <div>
          <h6 className="mb-2 text-xs font-medium text-neutral-600">Per-topic detail</h6>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-xs text-neutral-500">
                  <th className="py-1.5 pr-2 font-medium">id</th>
                  <th className="py-1.5 pr-2 font-medium">title / sample</th>
                  <th className="py-1.5 pr-2 font-medium">kind</th>
                  <th className="py-1.5 pr-2 font-medium">status / detail</th>
                  <th className="py-1.5 text-right font-medium">agree</th>
                </tr>
              </thead>
              <tbody>
                {groupResults(report.topics).map((g) => (
                  <Fragment key={g.path.join("/")}>
                    <tr className="bg-neutral-100">
                      <td colSpan={5} className="px-1 py-1 text-xs text-neutral-500">
                        {g.path.join(" / ")} · {g.topics.length}
                      </td>
                    </tr>
                    {g.topics.map((tp) => (
                      <ReportRow key={tp.key} tp={tp} selected={selected} onSelect={setSelected} />
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {report.judge && !report.judge.schemaEnforced ? (
          <div className="rounded-md border border-warn/40 bg-warn/10 p-2 text-xs text-neutral-700">
            Judge schema NOT enforced — verdicts ran blind, so read them with suspicion.
          </div>
        ) : null}
        {report.caveats.length ? (
          <ul className="list-disc pl-5 text-xs text-neutral-600">
            {report.caveats.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="min-h-72 lg:h-full">
        <AnswerDetail selection={selected} />
      </div>
    </div>
  );
};

export default Report;

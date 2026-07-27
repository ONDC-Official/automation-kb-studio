import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { pathKey, STATUS_BUCKET } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { CoverageNode } from "@/services/types";

/** One node row: counts per bucket, indented + disclosure-toggled by depth. */
const TreeRow = ({ node, depth, levels }: { node: CoverageNode; depth: number; levels: string[] }) => {
  const [open, setOpen] = useState(depth < 1);
  const label = levels[depth] ?? ""; // the human name for this taxonomy depth
  const hasChildren = node.children.length > 0;
  const real = node.topics.filter((t) => t.kind === "real");
  const canary = node.topics.filter((t) => t.kind === "canary");
  const grounded = real.filter((t) => STATUS_BUCKET[t.status] === "ok").length;
  const refused = real.filter((t) => STATUS_BUCKET[t.status] === "gap").length;
  const inconsistent = real.filter((t) => STATUS_BUCKET[t.status] === "caution").length;
  const bite = canary.filter((t) => STATUS_BUCKET[t.status] === "alarm").length;
  const Caret = open ? ChevronDown : ChevronRight;
  return (
    <>
      <tr className="border-b border-border/50">
        <td className="py-1">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 16 }}>
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="text-neutral-500 hover:text-foreground"
                aria-label={open ? "Collapse" : "Expand"}
              >
                <Caret className="size-3.5" />
              </button>
            ) : (
              <span className="inline-block size-3.5" />
            )}
            <span className="text-[13px] font-semibold">{node.segment || "all"}</span>
            {label ? <span className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</span> : null}
          </div>
        </td>
        <td className="text-neutral-600">{node.totals.topics}</td>
        <td className="text-right">{grounded}</td>
        <td className="text-right text-neutral-600">{refused}</td>
        <td className="text-right text-neutral-600">{inconsistent}</td>
        <td className={cn("text-right", bite > 0 ? "font-semibold text-error" : "text-neutral-600")}>{bite}</td>
      </tr>
      {open && hasChildren
        ? node.children.map((c) => <TreeRow key={pathKey(c.path)} node={c} depth={depth + 1} levels={levels} />)
        : null}
    </>
  );
};

/** The per-level drill-down table for a single report, fed by its `tree`. */
const CoverageTree = ({ tree, levels }: { tree: CoverageNode; levels: string[] }) => (
  <div>
    <h6 className="mb-2 text-xs font-medium text-neutral-600">Per-level drill-down</h6>
    {tree.children.length ? (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-neutral-500">
            <th className="font-medium">level path</th>
            <th className="font-medium">topics</th>
            <th className="text-right font-medium">grounded</th>
            <th className="text-right font-medium">refused</th>
            <th className="text-right font-medium">inconsistent</th>
            <th className="text-right font-medium">bite</th>
          </tr>
        </thead>
        <tbody>
          {tree.children.map((c) => (
            <TreeRow key={pathKey(c.path)} node={c} depth={0} levels={levels} />
          ))}
        </tbody>
      </table>
    ) : (
      <div className="text-sm text-neutral-500">No taxonomy nodes in this report.</div>
    )}
  </div>
);

export default CoverageTree;

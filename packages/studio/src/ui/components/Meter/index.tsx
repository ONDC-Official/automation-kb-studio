import type { HealthCounts } from "@/lib/derive";
import { cn } from "@/lib/utils";

const SEGMENTS: { key: keyof HealthCounts; cls: string }[] = [
  { key: "ok", cls: "bg-ok" },
  { key: "caution", cls: "bg-warn" },
  { key: "gap", cls: "bg-neutral-400" },
  { key: "alarm", cls: "bg-error" },
  { key: "unknown", cls: "bg-neutral-300" },
];

/** A stacked health meter. `width` sets an explicit CSS width (e.g. "110px"); default is full-width. */
const Meter = ({ counts, width, className }: { counts: HealthCounts; width?: string; className?: string }) => {
  const total = counts.total || 1;
  return (
    <div
      className={cn("flex h-1.5 overflow-hidden rounded-full bg-neutral-200", className)}
      style={width ? { width } : undefined}
    >
      {SEGMENTS.map(({ key, cls }) =>
        counts[key] ? (
          <i key={key} className={cls} style={{ width: `${String((counts[key] / total) * 100)}%` }} />
        ) : null,
      )}
    </div>
  );
};

export default Meter;

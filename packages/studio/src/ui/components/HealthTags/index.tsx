import type { HealthCounts } from "@/lib/derive";

/** Compact "N ok · N gap · N BIT" summary tags for a set of counts (only when coverage is present). */
const HealthTags = ({ counts, hasCoverage }: { counts: HealthCounts; hasCoverage: boolean }) => {
  if (!hasCoverage) return <span className="text-neutral-600">{counts.total} topics</span>;
  const bits: React.JSX.Element[] = [];
  if (counts.ok) bits.push(<span key="ok" className="text-ok"><b>{counts.ok}</b> ok</span>);
  if (counts.caution) bits.push(<span key="caution" className="text-warn"><b>{counts.caution}</b> caution</span>);
  if (counts.gap) bits.push(<span key="gap" className="text-neutral-500"><b>{counts.gap}</b> gap</span>);
  if (counts.alarm) bits.push(<span key="alarm" className="font-semibold text-error"><b>{counts.alarm}</b> BIT</span>);
  // No fallback "N topics": every caller shows the total adjacently, so a fallback here just duplicates it.
  return <span className="flex flex-wrap gap-x-2 text-xs">{bits}</span>;
};

export default HealthTags;

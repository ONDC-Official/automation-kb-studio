import { useEffect, useState } from "react";

import type { Selection } from "@/components/Transcript";
import { useCoverageReport, useCoverageRuns } from "@/hooks/useCoverage";
import { useManifest } from "@/hooks/useManifest";

/** All Coverage page state: selected run A/B, the detail-pane selection, and the loaded reports. */
export function useCoveragePage() {
  const runsQuery = useCoverageRuns();
  const runs = runsQuery.data ?? [];
  const levels = useManifest().data?.levels ?? [];

  const [runA, setRunA] = useState<string | null>(null);
  const [runB, setRunB] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  // Default A to the newest run once runs load.
  useEffect(() => {
    if (!runA && runs.length) setRunA(runs[0]!.file);
  }, [runA, runs]);

  const comparing = !!runB && runB !== runA;
  // React Query dedups + auto-disables on null; B only loads while comparing.
  const reportA = useCoverageReport(runA).data ?? null;
  const reportB = useCoverageReport(comparing ? runB : null).data ?? null;

  return {
    runs,
    isLoading: runsQuery.isLoading,
    levels,
    runA,
    runB,
    setRunA,
    setRunB,
    comparing,
    reportA,
    reportB,
    selection,
    setSelection,
  };
}

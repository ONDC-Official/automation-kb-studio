import Select from "@/components/Select";
import type { CoverageSummary } from "@/services/types";

import { optionLabel } from "./utils";

const NONE = "__none__";

interface IProps {
  runs: CoverageSummary[];
  runA: string | null;
  runB: string | null;
  onSelectA: (file: string) => void;
  onSelectB: (file: string | null) => void;
}

/** Pick run A (single view) and optionally run B to compare against. */
const RunPicker = ({ runs, runA, runB, onSelectA, onSelectB }: IProps) => {
  const options = runs.map((r) => ({ value: r.file, label: optionLabel(r) }));
  return (
    <div className="flex flex-wrap items-end gap-4">
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Run
        <Select
          value={runA ?? ""}
          onValueChange={onSelectA}
          options={options}
          placeholder="Select a run"
          aria-label="Run A"
          className="min-w-[22rem]"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-neutral-600">
        Compare against
        <Select
          value={runB ?? NONE}
          onValueChange={(v) => onSelectB(v === NONE ? null : v)}
          options={[{ value: NONE, label: "— none (single run) —" }, ...options]}
          aria-label="Run B"
          className="min-w-[22rem]"
        />
      </label>
    </div>
  );
};

export default RunPicker;

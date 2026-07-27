import PageHeader from "@/components/PageHeader";

import CompareView from "./CompareView";
import ReportView from "./ReportView";
import RunPicker from "./RunPicker";
import { useCoveragePage } from "./useCoveragePage";

const Coverage = () => {
  const { runs, isLoading, levels, runA, runB, setRunA, setRunB, comparing, reportA, reportB, selection, setSelection } =
    useCoveragePage();

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <PageHeader title="Coverage" description="Coverage & faithfulness of a source — not correctness." />

      {!runs.length ? (
        <div className="grid flex-1 place-items-center text-sm text-neutral-500">
          {isLoading ? "Loading runs…" : "No coverage runs yet. Run a coverage eval, then reload."}
        </div>
      ) : (
        <>
          <RunPicker runs={runs} runA={runA} runB={runB} onSelectA={setRunA} onSelectB={setRunB} />

          {comparing ? (
            reportA && reportB ? (
              <CompareView newer={reportA} older={reportB} />
            ) : (
              <div className="grid flex-1 place-items-center text-sm text-neutral-500">Loading reports…</div>
            )
          ) : reportA ? (
            <ReportView report={reportA} levels={levels} selection={selection} onSelect={setSelection} />
          ) : (
            <div className="grid flex-1 place-items-center text-sm text-neutral-500">Loading report…</div>
          )}
        </>
      )}
    </div>
  );
};

export default Coverage;

import type { EvalRunDetail, ResumeRequest } from "@/services/types";

import LiveFeed from "./LiveFeed";
import Report from "./Report";
import ResumeForm from "./ResumeForm";

interface IProps {
  detail: EvalRunDetail | undefined;
  loading: boolean;
  hasSelection: boolean;
  resuming: boolean;
  onResume: (req: ResumeRequest) => void;
}

const Empty = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="grid h-full place-items-center text-center text-sm text-neutral-500">
    <div>
      <div className="text-base font-medium text-foreground">{title}</div>
      {children}
    </div>
  </div>
);

/** The selected run: live feed while running, resume form when stopped, the report once finished. */
const RunDetail = ({ detail, loading, hasSelection, resuming, onResume }: IProps) => {
  if (!detail) {
    if (loading || hasSelection) return <Empty title="Loading run…" />;
    return <Empty title="No run selected">Pick a run above, or hit New run to configure one.</Empty>;
  }
  if (detail.status === "running") return <LiveFeed detail={detail} />;
  if (detail.status === "paused" || detail.status === "interrupted") {
    return (
      <div className="flex flex-col gap-4">
        <ResumeForm run={detail} resuming={resuming} onResume={onResume} />
        <LiveFeed detail={detail} />
      </div>
    );
  }
  if (detail.status === "failed") {
    return (
      <div className="rounded-md border border-error/40 bg-error/10 p-3 text-sm text-error">
        Run failed: {detail.error?.message ?? "unknown error"}
      </div>
    );
  }
  if (detail.status === "canceled") {
    return <Empty title="Canceled">This run was stopped before it finished.</Empty>;
  }
  if (!detail.report) return <Empty title="Loading report…" />;
  return <Report report={detail.report} />;
};

export default RunDetail;

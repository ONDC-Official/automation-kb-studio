import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";

import RunDetail from "./RunDetail";
import RunForm from "./RunForm";
import RunList from "./RunList";
import { useEvaluatePage } from "./useEvaluatePage";

const Evaluate = () => {
  const {
    form,
    topics,
    nodes,
    scope,
    onScope,
    canSubmit,
    onSubmit,
    submitting,
    resuming,
    runs,
    selectedId,
    showConfig,
    detail,
    detailLoading,
    running,
    selectRun,
    newRun,
    onPause,
    onResume,
    onDelete,
  } = useEvaluatePage();

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <PageHeader
        title="Evaluate"
        description="Point the harness at your endpoint, pick a topic scope, and probe the KB live."
        actions={
          <>
            {running && selectedId ? (
              <Button variant="outline" size="sm" onClick={() => void onPause(selectedId)}>
                Pause
              </Button>
            ) : null}
            {!showConfig && selectedId ? (
              <Button variant="destructive" size="sm" onClick={() => void onDelete(selectedId)}>
                Delete
              </Button>
            ) : null}
            <Button variant={showConfig ? "outline" : "default"} size="sm" onClick={newRun}>
              New run
            </Button>
          </>
        }
      />

      <RunList runs={runs} selectedId={showConfig ? null : selectedId} onSelect={selectRun} />

      <div className="min-h-0 flex-1 overflow-auto">
        {showConfig ? (
          <RunForm
            form={form}
            topics={topics}
            nodes={nodes}
            scope={scope}
            onScope={onScope}
            onSubmit={onSubmit}
            submitting={submitting}
            canSubmit={canSubmit}
          />
        ) : (
          <RunDetail
            detail={detail}
            loading={detailLoading}
            hasSelection={selectedId !== null}
            resuming={resuming}
            onResume={(req) => selectedId && void onResume(selectedId, req)}
          />
        )}
      </div>
    </div>
  );
};

export default Evaluate;

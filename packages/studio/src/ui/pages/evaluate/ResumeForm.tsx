import { useForm } from "react-hook-form";

import Button from "@/components/Button";
import type { EvalRunDetail, ResumeRequest } from "@/services/types";

import EndpointFields from "./EndpointFields";
import type { RunFormValues } from "./types";
import { endpointComplete, fromEcho, toWire } from "./utils";

interface IProps {
  run: EvalRunDetail;
  resuming: boolean;
  onResume: (req: ResumeRequest) => void;
}

/** Re-enter keys to resume a paused/interrupted run — provider/URL/model are remembered, the scope is fixed. */
const ResumeForm = ({ run, resuming, onResume }: IProps) => {
  const form = useForm<RunFormValues>({
    defaultValues: { source: fromEcho(run.source), judge: fromEcho(run.judge) },
  });
  const { register, control, watch } = form;
  const values = watch();
  const ready = endpointComplete(values.source) && endpointComplete(values.judge);

  return (
    <form
      className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onResume({ source: toWire(values.source), judge: toWire(values.judge) });
      }}
    >
      <p className="text-xs text-neutral-600">
        Re-enter the API keys to continue from topic {run.progress.done + 1} of {run.progress.total}. Keys were
        never stored.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <EndpointFields
          title="Endpoint under test"
          hint="Same endpoint as before — just the key."
          base="source"
          register={register}
          control={control}
        />
        <EndpointFields
          title="Judge endpoint"
          hint="Same judge as before — just the key."
          base="judge"
          register={register}
          control={control}
        />
      </div>
      <div>
        <Button type="submit" disabled={!ready || resuming}>
          {resuming ? "Resuming…" : "Resume run"}
        </Button>
      </div>
    </form>
  );
};

export default ResumeForm;

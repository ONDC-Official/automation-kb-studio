import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import Button from "@/components/Button";
import type { NodeInfo, Topic } from "@/services/types";

import EndpointFields from "./EndpointFields";
import ScopePicker from "./ScopePicker";
import type { RunFormValues } from "./types";

interface IProps {
  form: UseFormReturn<RunFormValues>;
  topics: Topic[];
  nodes: NodeInfo[];
  scope: Set<string>;
  onScope: (next: Set<string>) => void;
  onSubmit: () => void;
  submitting: boolean;
  canSubmit: boolean;
}

/** The run-config form: topic scope + the endpoint under test + a trusted judge. */
const RunForm = ({ form, topics, nodes, scope, onScope, onSubmit, submitting, canSubmit }: IProps) => {
  const { register, control } = form;
  const [scopeOpen, setScopeOpen] = useState(false);
  const whole = scope.size >= topics.length;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-md border border-border bg-surface p-3">
          <div className="text-sm font-medium text-foreground">Topics</div>
          <p className="text-xs text-neutral-600">
            {whole ? "Covering the whole KB." : `Covering ${String(scope.size)} of ${String(topics.length)} topics.`}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setScopeOpen((o) => !o)}>
            {scopeOpen ? "Hide topics" : "Choose topics"}
          </Button>
          {scopeOpen && <ScopePicker topics={topics} nodes={nodes} selected={scope} onChange={onScope} />}
        </div>
        <EndpointFields
          title="Endpoint under test"
          hint="Your model/agent endpoint. Its coverage of the KB is what gets measured."
          base="source"
          register={register}
          control={control}
        />
        <EndpointFields
          title="Judge endpoint"
          hint="A separate, trusted model that grades the answers — a source must not grade itself."
          base="judge"
          register={register}
          control={control}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? "Starting…" : `Run coverage${whole ? "" : ` (${String(scope.size)})`}`}
        </Button>
        <span className="text-xs text-neutral-500">Keys are used for this run only and never saved.</span>
      </div>
    </form>
  );
};

export default RunForm;

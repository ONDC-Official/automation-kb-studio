import type { SelectOption } from "@/components/Select";
import type { EvalProvider, EvalRunStatus, TopicStatus } from "@/services/types";

import type { RunFormValues } from "./types";

/** Sensible default transports per protocol (shown as the base-URL default). */
export const DEFAULT_BASE: Record<EvalProvider, string> = {
  openai: "http://localhost:1234/v1",
  anthropic: "https://api.anthropic.com",
};

export const PROVIDER_OPTIONS: SelectOption[] = [
  { value: "openai", label: "OpenAI-compatible" },
  { value: "anthropic", label: "Anthropic Messages" },
];

/** Badge tone per run status (fixed ok/caution/alarm palette). */
export const STATUS_TONE: Record<EvalRunStatus, "ok" | "caution" | "alarm" | "muted" | "neutral"> = {
  running: "caution",
  paused: "muted",
  interrupted: "caution",
  succeeded: "ok",
  failed: "alarm",
  canceled: "neutral",
};

export const STATUS_LABEL: Record<EvalRunStatus, string> = {
  running: "running",
  paused: "paused",
  interrupted: "interrupted",
  succeeded: "done",
  failed: "failed",
  canceled: "canceled",
};

/** The live tally chips, in display order. */
export const TALLY: { status: TopicStatus; label: string }[] = [
  { status: "grounded", label: "grounded" },
  { status: "refused", label: "refused" },
  { status: "inconsistent", label: "inconsistent" },
  { status: "confident-ungrounded", label: "ungrounded" },
  { status: "canary-ok", label: "canary ok" },
  { status: "canary-bit", label: "canary bite" },
];

export const DEFAULT_FORM: RunFormValues = {
  source: { provider: "openai", baseUrl: DEFAULT_BASE.openai, model: "", apiKey: "", temperature: "" },
  judge: { provider: "anthropic", baseUrl: DEFAULT_BASE.anthropic, model: "", apiKey: "", temperature: "" },
};

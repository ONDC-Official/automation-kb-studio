import type { EvalProvider } from "@/services/types";

/** One endpoint block as the form holds it — temperature stays a string ("" = omit). */
export interface IEndpointForm {
  provider: EvalProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
  temperature: string;
}

/** The run-config form: the endpoint under test plus a trusted judge. */
export interface RunFormValues {
  source: IEndpointForm;
  judge: IEndpointForm;
}

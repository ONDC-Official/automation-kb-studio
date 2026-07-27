import type { Control, FieldPath, FieldValues, UseFormRegister } from "react-hook-form";

import FormInput from "@/components/FormInput";
import FormSelect from "@/components/FormSelect";

import { PROVIDER_OPTIONS } from "./constants";

interface IProps<T extends FieldValues> {
  title: string;
  hint: string;
  /** The endpoint's field prefix in the form, e.g. "source" or "judge". */
  base: FieldPath<T>;
  register: UseFormRegister<T>;
  control: Control<T>;
}

/** One credential block (provider / base URL / model / temperature / key), reused by both forms. */
const EndpointFields = <T extends FieldValues>({ title, hint, base, register, control }: IProps<T>) => {
  const field = (suffix: string): FieldPath<T> => `${base}.${suffix}` as FieldPath<T>;
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface p-3">
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <p className="mt-0.5 text-xs text-neutral-600">{hint}</p>
      </div>
      <FormSelect label="Protocol" name={field("provider")} control={control} options={PROVIDER_OPTIONS} />
      <FormInput
        label="Base URL"
        registration={register(field("baseUrl"))}
        placeholder="https://host/v1"
      />
      <FormInput
        label="Model"
        registration={register(field("model"))}
        placeholder="model your endpoint serves"
      />
      <FormInput
        label="Temperature (optional)"
        type="number"
        step="0.1"
        registration={register(field("temperature"))}
        placeholder="provider default"
      />
      <FormInput
        label="API key"
        type="password"
        autoComplete="off"
        registration={register(field("apiKey"))}
        placeholder="sent once, never stored"
      />
    </div>
  );
};

export default EndpointFields;

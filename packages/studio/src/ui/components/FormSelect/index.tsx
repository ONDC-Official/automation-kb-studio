import { type Control, type FieldPath, type FieldValues, Controller } from "react-hook-form";

import Select, { type SelectOption } from "@/components/Select";
import { cn } from "@/lib/utils";

interface IProps<T extends FieldValues> {
  label?: string;
  error?: string;
  name: FieldPath<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

/** RHF-controlled Radix Select (Radix Select can't take `register`, so it needs `control` + `name`). */
const FormSelect = <T extends FieldValues>({
  label,
  error,
  name,
  control,
  options,
  placeholder,
  className,
}: IProps<T>) => (
  <label className={cn("flex flex-col gap-1", className)}>
    {label && <span className="text-xs font-medium text-neutral-600">{label}</span>}
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select value={field.value} onValueChange={field.onChange} options={options} placeholder={placeholder} />
      )}
    />
    {error && <span className="text-xs text-error">{error}</span>}
  </label>
);

export default FormSelect;

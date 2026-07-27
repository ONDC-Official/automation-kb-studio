import type { ComponentProps } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import Input from "@/components/Input";
import { cn } from "@/lib/utils";

interface IProps extends Omit<ComponentProps<"input">, "className"> {
  label?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  className?: string;
}

const FormInput = ({ label, error, registration, className, ...props }: IProps) => (
  <label className={cn("flex flex-col gap-1", className)}>
    {label && <span className="text-xs font-medium text-neutral-600">{label}</span>}
    <Input aria-invalid={Boolean(error)} {...registration} {...props} />
    {error && <span className="text-xs text-error">{error}</span>}
  </label>
);

export default FormInput;

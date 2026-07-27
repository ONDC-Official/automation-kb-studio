import { Check, ChevronDown } from "lucide-react";
import { Select as RadixSelect } from "radix-ui";

import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface IProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string | undefined;
  disabled?: boolean;
  className?: string | undefined;
  "aria-label"?: string | undefined;
}

/** A styled Radix Select. Controlled by `value`/`onValueChange` (works standalone or under RHF Controller). */
const Select = ({ value, onValueChange, options, placeholder, disabled = false, className, ...aria }: IProps) => (
  <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
    <RadixSelect.Trigger
      data-slot="select-trigger"
      aria-label={aria["aria-label"]}
      className={cn(
        "inline-flex h-8 items-center justify-between gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-foreground focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50",
        className,
      )}
    >
      <RadixSelect.Value placeholder={placeholder} />
      <RadixSelect.Icon>
        <ChevronDown className="size-4 text-neutral-500" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={4}
        className="z-50 max-h-72 overflow-hidden rounded-md border border-border bg-surface shadow-md"
      >
        <RadixSelect.Viewport className="p-1">
          {options.map((opt) => (
            <RadixSelect.Item
              key={opt.value}
              value={opt.value}
              className="relative flex h-7 cursor-pointer items-center rounded-sm pr-6 pl-2 text-sm text-foreground outline-none data-[highlighted]:bg-accent-100 data-[highlighted]:text-accent-700"
            >
              <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
              <RadixSelect.ItemIndicator className="absolute right-1.5">
                <Check className="size-3.5" />
              </RadixSelect.ItemIndicator>
            </RadixSelect.Item>
          ))}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  </RadixSelect.Root>
);

export default Select;

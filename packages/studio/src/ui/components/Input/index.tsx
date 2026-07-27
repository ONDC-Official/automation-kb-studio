import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const Input = ({ className, ...props }: ComponentProps<"input">) => (
  <input
    data-slot="input"
    className={cn(
      "h-8 w-full rounded-md border border-border bg-surface px-2.5 text-sm text-foreground placeholder:text-neutral-500 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

export default Input;

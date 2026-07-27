import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const Textarea = ({ className, ...props }: ComponentProps<"textarea">) => (
  <textarea
    data-slot="textarea"
    className={cn(
      "w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-foreground placeholder:text-neutral-500 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50",
      className,
    )}
    {...props}
  />
);

export default Textarea;

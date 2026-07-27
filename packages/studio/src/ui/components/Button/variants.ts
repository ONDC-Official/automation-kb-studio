import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-accent-600 text-neutral-100 hover:bg-accent-700",
        outline: "border border-border bg-surface text-foreground hover:bg-neutral-200",
        ghost: "text-foreground hover:bg-neutral-200",
        subtle: "bg-neutral-200 text-foreground hover:bg-neutral-300",
        destructive: "bg-error text-neutral-100 hover:opacity-90",
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        default: "h-8 px-3",
        lg: "h-9 px-4",
        icon: "size-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

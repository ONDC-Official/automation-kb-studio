import { cva } from "class-variance-authority";

/** Status tone follows the fixed app palette: ok=emerald/ok, caution=amber/warn, alarm=red/error. */
export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        ok: "bg-ok/15 text-ok",
        caution: "bg-warn/15 text-warn",
        alarm: "bg-error/15 text-error",
        muted: "bg-neutral-200 text-neutral-600",
        neutral: "bg-neutral-200 text-neutral-700",
        accent: "bg-accent-100 text-accent-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

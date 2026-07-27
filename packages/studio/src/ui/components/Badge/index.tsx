import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { badgeVariants } from "./variants";

interface IProps extends ComponentProps<"span">, VariantProps<typeof badgeVariants> {}

const Badge = ({ className, tone, ...props }: IProps) => (
  <span data-slot="badge" className={cn(badgeVariants({ tone }), className)} {...props} />
);

export default Badge;

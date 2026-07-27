import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface IProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

const PageHeader = ({ title, description, actions, className }: IProps) => (
  <div className={cn("flex items-start justify-between gap-4", className)}>
    <div className="min-w-0">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-neutral-600">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;

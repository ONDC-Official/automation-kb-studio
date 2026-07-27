import type { ReactNode } from "react";
import { Tooltip as RadixTooltip } from "radix-ui";

interface IProps {
  content: ReactNode;
  children: ReactNode;
}

/** A hover/focus tooltip. Wrap the app once in `RadixTooltip.Provider` (done in main.tsx). */
const Tooltip = ({ content, children }: IProps) => (
  <RadixTooltip.Root>
    <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        sideOffset={4}
        className="z-50 max-w-xs rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground shadow-md"
      >
        {content}
        <RadixTooltip.Arrow className="fill-surface" />
      </RadixTooltip.Content>
    </RadixTooltip.Portal>
  </RadixTooltip.Root>
);

export default Tooltip;

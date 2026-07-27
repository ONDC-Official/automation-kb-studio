import type { ReactNode } from "react";
import { DropdownMenu as RadixMenu } from "radix-ui";

import { cn } from "@/lib/utils";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface IProps {
  trigger: ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
}

/** A click-triggered action menu (node/topic row actions). Items separated by `null` render a divider. */
const DropdownMenu = ({ trigger, items, align = "end" }: IProps) => (
  <RadixMenu.Root>
    <RadixMenu.Trigger asChild>{trigger}</RadixMenu.Trigger>
    <RadixMenu.Portal>
      <RadixMenu.Content
        align={align}
        sideOffset={4}
        className="z-50 min-w-40 rounded-md border border-border bg-surface p-1 shadow-md"
      >
        {items.map((item, i) => (
          <RadixMenu.Item
            key={i}
            disabled={item.disabled ?? false}
            onSelect={item.onSelect}
            className={cn(
              "flex h-7 cursor-pointer items-center rounded-sm px-2 text-sm outline-none data-[highlighted]:bg-neutral-200 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              item.danger ? "text-error" : "text-foreground",
            )}
          >
            {item.label}
          </RadixMenu.Item>
        ))}
      </RadixMenu.Content>
    </RadixMenu.Portal>
  </RadixMenu.Root>
);

export default DropdownMenu;

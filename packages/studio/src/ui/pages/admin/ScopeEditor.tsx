import { X } from "lucide-react";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import DropdownMenu from "@/components/DropdownMenu";
import type { NodeInfo } from "@/services/types";

import { availableScopes, scopeKey, scopeLabel } from "./utils";

interface IProps {
  scopes: string[][];
  nodes: NodeInfo[];
  onChange: (next: string[][]) => void;
}

/** Chips for a scope list plus an "add scope" menu of the remaining node paths (and root). */
const ScopeEditor = ({ scopes, nodes, onChange }: IProps) => {
  const options = availableScopes(scopes, nodes);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {scopes.length === 0 && <span className="text-xs text-neutral-500">no scopes — read-only</span>}
      {scopes.map((s) => (
        <Badge key={scopeKey(s)} tone="accent" className="gap-1">
          {scopeLabel(s)}
          <button
            type="button"
            title="Remove scope"
            className="text-accent-700 hover:text-error"
            onClick={() => onChange(scopes.filter((x) => scopeKey(x) !== scopeKey(s)))}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      {options.length > 0 && (
        <DropdownMenu
          align="start"
          trigger={
            <Button variant="ghost" size="sm">
              + add scope
            </Button>
          }
          items={options.map((p) => ({ label: scopeLabel(p), onSelect: () => onChange([...scopes, p]) }))}
        />
      )}
    </div>
  );
};

export default ScopeEditor;

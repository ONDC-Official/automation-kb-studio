import { Plus } from "lucide-react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import type { StatusBucket } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { Kind } from "@/services/types";
import { KIND_CHIPS, STATUS_CHIPS } from "./constants";

interface IProps {
  query: string;
  setQuery: (q: string) => void;
  kindFilter: Kind | null;
  toggleKind: (k: Kind) => void;
  statusFilter: StatusBucket | null;
  toggleStatus: (b: StatusBucket) => void;
  hasCoverage: boolean;
  onNewTopic: (kind: Kind) => void;
}

const chip = (active: boolean): string =>
  cn(
    "rounded-full border px-2.5 py-1 text-xs transition-colors",
    active ? "border-accent-500 bg-accent-100 text-accent-700" : "border-border text-neutral-600 hover:bg-neutral-200",
  );

const Toolbar = ({ query, setQuery, kindFilter, toggleKind, statusFilter, toggleStatus, hasCoverage, onNewTopic }: IProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Input className="max-w-xs" placeholder="Search topics…" value={query} onChange={(e) => setQuery(e.target.value)} />
    <div className="flex flex-wrap gap-1.5">
      {KIND_CHIPS.map((c) => (
        <button key={c.kind} type="button" className={chip(kindFilter === c.kind)} onClick={() => toggleKind(c.kind)}>
          {c.label}
        </button>
      ))}
      {hasCoverage &&
        STATUS_CHIPS.map((c) => (
          <button key={c.bucket} type="button" className={chip(statusFilter === c.bucket)} onClick={() => toggleStatus(c.bucket)}>
            {c.label}
          </button>
        ))}
    </div>
    <Button className="ml-auto" size="sm" onClick={() => onNewTopic("real")}>
      <Plus /> New topic
    </Button>
  </div>
);

export default Toolbar;

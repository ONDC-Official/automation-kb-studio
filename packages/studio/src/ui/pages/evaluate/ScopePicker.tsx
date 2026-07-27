import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import Badge from "@/components/Badge";
import Button from "@/components/Button";
import { buildNodeTree, pathKey, topicKey, type TreeNode } from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { NodeInfo, Topic } from "@/services/types";

type CheckState = "on" | "off" | "partial";

const Check = ({ state, onClick }: { state: CheckState; onClick: () => void }) => (
  <span
    role="checkbox"
    aria-checked={state === "partial" ? "mixed" : state === "on"}
    tabIndex={0}
    className={cn(
      "grid size-4 shrink-0 cursor-pointer place-items-center rounded-sm border border-border text-[10px] leading-none",
      state === "on" && "border-accent bg-accent text-white",
      state === "partial" && "border-accent bg-accent-100 text-accent-700",
    )}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
  >
    {state === "on" ? "✓" : state === "partial" ? "–" : ""}
  </span>
);

interface IProps {
  topics: Topic[];
  nodes: NodeInfo[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}

/** Tri-state checkbox tree over the taxonomy — scope a run to a subtree, a few folders, or single topics. */
const ScopePicker = ({ topics, nodes, selected, onChange }: IProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const { tree, topicsByPath, descKeys, allKeys } = useMemo(() => {
    const tree = buildNodeTree(nodes);
    const topicsByPath = new Map<string, Topic[]>();
    const descKeys = new Map<string, string[]>(); // pathKey → every topicKey at or under it
    const allKeys: string[] = [];
    for (const t of topics) {
      const key = topicKey(t);
      allKeys.push(key);
      const pk = pathKey(t.path);
      (topicsByPath.get(pk) ?? topicsByPath.set(pk, []).get(pk)!).push(t);
      for (let i = 1; i <= t.path.length; i++) {
        const ak = pathKey(t.path.slice(0, i));
        (descKeys.get(ak) ?? descKeys.set(ak, []).get(ak)!).push(key);
      }
    }
    return { tree, topicsByPath, descKeys, allKeys };
  }, [topics, nodes]);

  const folderState = (path: string[]): CheckState => {
    const keys = descKeys.get(pathKey(path)) ?? [];
    if (keys.length === 0) return "off";
    let n = 0;
    for (const k of keys) if (selected.has(k)) n++;
    return n === 0 ? "off" : n === keys.length ? "on" : "partial";
  };

  const setKeys = (keys: string[], on: boolean): void => {
    const next = new Set(selected);
    for (const k of keys) {
      if (on) next.add(k);
      else next.delete(k);
    }
    onChange(next);
  };
  const toggleTopic = (key: string): void => setKeys([key], !selected.has(key));
  const toggleFolder = (path: string[]): void =>
    setKeys(descKeys.get(pathKey(path)) ?? [], folderState(path) !== "on");
  const toggleExpand = (pk: string): void => {
    const next = new Set(expanded);
    if (next.has(pk)) next.delete(pk);
    else next.add(pk);
    setExpanded(next);
  };
  const selectKind = (kind: "real" | "canary"): void =>
    setKeys(topics.filter((t) => t.kind === kind).map(topicKey), true);

  const renderNode = (node: TreeNode, depth: number): React.JSX.Element => {
    const pk = pathKey(node.path);
    const isOpen = expanded.has(pk);
    const count = (descKeys.get(pk) ?? []).length;
    const directTopics = topicsByPath.get(pk) ?? [];
    const hasChildren = node.children.length > 0 || directTopics.length > 0;
    return (
      <div key={pk}>
        <div className="flex items-center gap-2 py-0.5" style={{ paddingLeft: `${String(depth * 16)}px` }}>
          <button
            type="button"
            className="grid size-4 place-items-center text-neutral-500"
            onClick={() => toggleExpand(pk)}
            aria-label={isOpen ? "collapse" : "expand"}
          >
            {hasChildren ? isOpen ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" /> : null}
          </button>
          <Check state={folderState(node.path)} onClick={() => toggleFolder(node.path)} />
          <span className="cursor-pointer text-sm" onClick={() => toggleExpand(pk)}>
            {node.segment}
          </span>
          <span className="text-xs text-neutral-500">{count}</span>
        </div>
        {isOpen && (
          <>
            {node.children.map((c) => renderNode(c, depth + 1))}
            {directTopics.map((t) => {
              const key = topicKey(t);
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 py-0.5"
                  style={{ paddingLeft: `${String((depth + 1) * 16)}px` }}
                >
                  <span className="size-4" />
                  <Check state={selected.has(key) ? "on" : "off"} onClick={() => toggleTopic(key)} />
                  <span className="cursor-pointer font-mono text-xs" onClick={() => toggleTopic(key)}>
                    {t.id}
                  </span>
                  <Badge tone={t.kind === "canary" ? "accent" : "neutral"}>{t.kind}</Badge>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mt-2 rounded-md border border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1.5">
        <span className="text-xs text-neutral-600">
          <b className="text-foreground">{selected.size}</b> of {allKeys.length} topics
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onChange(new Set(allKeys))}>
            All
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange(new Set())}>
            None
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectKind("real")}>
            + real
          </Button>
          <Button variant="ghost" size="sm" onClick={() => selectKind("canary")}>
            + canary
          </Button>
        </div>
      </div>
      <div className="max-h-72 overflow-auto p-1">
        {tree.length ? (
          tree.map((n) => renderNode(n, 0))
        ) : (
          <div className="p-2 text-sm text-neutral-500">No topics in this KB.</div>
        )}
      </div>
    </div>
  );
};

export default ScopePicker;

import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreHorizontal } from "lucide-react";

import DropdownMenu, { type MenuItem } from "@/components/DropdownMenu";
import HealthTags from "@/components/HealthTags";
import Meter from "@/components/Meter";
import {
  buildNodeTree,
  emptyHealth,
  healthOf,
  inScope,
  pathKey,
  pathStartsWith,
  slug,
  type HealthCounts,
  type StatusIndex,
  type TreeNode,
} from "@/lib/derive";
import { cn } from "@/lib/utils";
import type { Manifest, NodeInfo, Topic } from "@/services/types";
import { RAIL_DEFAULT, RAIL_KEY, RAIL_MAX, RAIL_MIN } from "./constants";

type Editing = { mode: "create"; parent: string[] } | { mode: "rename"; path: string[] } | null;

interface Ctx {
  topics: Topic[];
  index: StatusIndex;
  hasCoverage: boolean;
  selectedPath: string[];
  collapsed: Record<string, boolean>;
  scopes: string[][];
  selectPath: (p: string[]) => void;
  toggleCollapse: (p: string[]) => void;
  editing: Editing;
  setEditing: (e: Editing) => void;
  onCreateNode: (path: string[]) => void;
  onRenameNode: (from: string[], to: string[]) => void;
  onDeleteNode: (path: string[], hasTopics: boolean) => void;
}

const INDENT = 12;

function healthUnder(ctx: Ctx, prefix: string[]): { count: number; health: HealthCounts } {
  const under = ctx.topics.filter((t) => pathStartsWith(t.path, prefix));
  return { count: under.length, health: ctx.hasCoverage ? healthOf(under, ctx.index) : emptyHealth() };
}

function InlineInput({ initial, indent, onCommit, onCancel }: { initial: string; indent: number; onCommit: (v: string) => void; onCancel: () => void }) {
  const [v, setV] = useState(initial);
  return (
    <div style={{ paddingLeft: indent }} className="py-0.5">
      <input
        autoFocus
        placeholder="segment-name"
        value={v}
        className="h-6 w-full rounded-sm border border-accent-400 bg-background px-1.5 text-xs"
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(slug(v));
          else if (e.key === "Escape") onCancel();
        }}
        onBlur={() => onCommit(slug(v))}
      />
    </div>
  );
}

function NodeRow({ node, depth, ctx }: { node: TreeNode; depth: number; ctx: Ctx }) {
  const key = pathKey(node.path);
  const selected = pathKey(ctx.selectedPath) === key;
  const collapsed = ctx.collapsed[key] ?? false;
  const hasChildren = node.children.length > 0;
  const { count, health } = healthUnder(ctx, node.path);
  const indent = 8 + depth * INDENT;
  const canEdit = inScope(node.path, ctx.scopes);

  if (ctx.editing?.mode === "rename" && pathKey(ctx.editing.path) === key) {
    return (
      <InlineInput
        initial={node.segment}
        indent={indent}
        onCancel={() => ctx.setEditing(null)}
        onCommit={(v) => {
          ctx.setEditing(null);
          if (v && v !== node.segment) ctx.onRenameNode(node.path, [...node.path.slice(0, -1), v]);
        }}
      />
    );
  }

  const items: MenuItem[] = [
    { label: "＋ New sub-node", onSelect: () => ctx.setEditing({ mode: "create", parent: node.path }) },
    ...(canEdit
      ? [
          { label: "Rename…", onSelect: () => ctx.setEditing({ mode: "rename", path: node.path }) },
          {
            label: "Delete node",
            danger: true,
            onSelect: () => ctx.onDeleteNode(node.path, ctx.topics.some((t) => pathStartsWith(t.path, node.path))),
          },
        ]
      : []),
  ];

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        style={{ paddingLeft: indent }}
        onClick={() => ctx.selectPath(node.path)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") ctx.selectPath(node.path);
        }}
        className={cn(
          "group flex flex-col gap-1 rounded-sm py-1 pr-1 transition-colors",
          selected ? "bg-accent-100" : "hover:bg-neutral-200",
        )}
      >
        <div className="flex items-center gap-1">
          {hasChildren ? (
            <button
              type="button"
              className="text-neutral-500"
              title={collapsed ? "Expand" : "Collapse"}
              onClick={(e) => {
                e.stopPropagation();
                ctx.toggleCollapse(node.path);
              }}
            >
              {collapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          ) : (
            <span className="w-3.5" />
          )}
          <span className="text-neutral-500">{hasChildren && !collapsed ? <FolderOpen className="size-3.5" /> : <Folder className="size-3.5" />}</span>
          <span className={cn("truncate text-sm", selected && "font-medium text-accent-700")}>{node.segment}</span>
          <span className="text-xs text-neutral-500">{count}</span>
          <DropdownMenu
            trigger={
              <button
                type="button"
                className="ml-auto text-neutral-500 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-3.5" />
              </button>
            }
            items={items}
          />
        </div>
        {ctx.hasCoverage && (
          <div className="flex flex-col gap-1 pr-1 pl-5">
            <Meter counts={health} />
            <div className="text-[10px]">
              <HealthTags counts={{ ...health, total: count }} hasCoverage />
            </div>
          </div>
        )}
      </div>

      {ctx.editing?.mode === "create" && pathKey(ctx.editing.parent) === key && (
        <InlineInput
          initial=""
          indent={8 + (depth + 1) * INDENT}
          onCancel={() => ctx.setEditing(null)}
          onCommit={(v) => {
            ctx.setEditing(null);
            if (v) ctx.onCreateNode([...node.path, v]);
          }}
        />
      )}

      {!collapsed && node.children.map((child) => <NodeRow key={pathKey(child.path)} node={child} depth={depth + 1} ctx={ctx} />)}
    </>
  );
}

interface IProps {
  nodes: NodeInfo[];
  manifest: Manifest | null;
  index: StatusIndex;
  hasCoverage: boolean;
  selectedPath: string[];
  selectPath: (p: string[]) => void;
  collapsed: Record<string, boolean>;
  toggleCollapse: (p: string[]) => void;
  scopes: string[][];
  onCreateNode: (path: string[]) => void;
  onRenameNode: (from: string[], to: string[]) => void;
  onDeleteNode: (path: string[], hasTopics: boolean) => void;
}

const PathTree = (props: IProps) => {
  const [editing, setEditing] = useState<Editing>(null);
  const [width, setWidth] = useState(() => {
    const saved = Number(localStorage.getItem(RAIL_KEY));
    return saved >= RAIL_MIN && saved <= RAIL_MAX ? saved : RAIL_DEFAULT;
  });
  const tree = buildNodeTree(props.nodes);
  const topics = props.manifest?.topics ?? [];
  const ctx: Ctx = { ...props, topics, editing, setEditing };
  const root = healthUnder(ctx, []);

  const startResize = (e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    let w = startW;
    const onMove = (ev: PointerEvent) => {
      w = Math.min(RAIL_MAX, Math.max(RAIL_MIN, startW + ev.clientX - startX));
      setWidth(w);
    };
    const onUp = () => {
      localStorage.setItem(RAIL_KEY, String(w));
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <aside className="relative flex shrink-0 flex-col overflow-hidden border-r border-border" style={{ width }}>
      <div className="flex items-center justify-between px-3 py-2 text-xs font-medium tracking-wide text-neutral-500 uppercase">
        Explorer
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-1 pb-2">
        <div
          role="button"
          tabIndex={0}
          onClick={() => props.selectPath([])}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") props.selectPath([]);
          }}
          className={cn(
            "flex items-center gap-1 rounded-sm py-1 pr-1 pl-2 transition-colors",
            props.selectedPath.length === 0 ? "bg-accent-100" : "hover:bg-neutral-200",
          )}
        >
          <Folder className="size-3.5 text-neutral-500" />
          <span className={cn("truncate text-sm", props.selectedPath.length === 0 && "font-medium text-accent-700")}>
            {props.manifest?.id ?? "all"}
          </span>
          <span className="text-xs text-neutral-500">{root.count}</span>
        </div>

        {tree.map((node) => (
          <NodeRow key={pathKey(node.path)} node={node} depth={0} ctx={ctx} />
        ))}

        {editing?.mode === "create" && editing.parent.length === 0 ? (
          <InlineInput
            initial=""
            indent={8}
            onCancel={() => setEditing(null)}
            onCommit={(v) => {
              setEditing(null);
              if (v) props.onCreateNode([v]);
            }}
          />
        ) : (
          <button
            type="button"
            className="mt-1 w-full rounded-sm px-2 py-1 text-left text-xs text-neutral-500 hover:bg-neutral-200"
            onClick={() => setEditing({ mode: "create", parent: [] })}
          >
            ＋ new node
          </button>
        )}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        title="Drag to resize"
        onPointerDown={startResize}
        className="absolute inset-y-0 right-0 w-1 cursor-col-resize hover:bg-accent-400"
      />
    </aside>
  );
};

export default PathTree;

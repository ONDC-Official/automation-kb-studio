/**
 * PathTree — the left spine. Renders the ragged taxonomy (`GET /api/nodes`) as a recursive, collapsible
 * drill-down: domain → version → usecase … Each node shows its segment, a topic count, and — when a
 * coverage report is loaded — a small health meter. Selecting a node filters the topic list to that
 * path PREFIX; an "All" root clears the filter. Inline affordances create a child node, rename/move a
 * node, or delete it (with a cascade confirm handled by the parent when non-empty).
 */
import { useState, type Dispatch } from "react";

import {
  buildNodeTree,
  emptyHealth,
  healthOf,
  pathKey,
  pathStartsWith,
  slug,
  type HealthCounts,
  type StatusIndex,
  type TreeNode,
} from "../derive";
import type { Action } from "../state";
import type { Manifest, NodeInfo, Topic } from "../types";
import { HealthTags, Meter } from "./common";

type Editing =
  | { mode: "create"; parent: string[] }
  | { mode: "rename"; path: string[] }
  | null;

interface Ctx {
  topics: Topic[];
  index: StatusIndex;
  hasCoverage: boolean;
  selectedPath: string[];
  collapsed: Record<string, boolean>;
  dispatch: Dispatch<Action>;
  editing: Editing;
  setEditing: (e: Editing) => void;
  onCreateNode: (path: string[]) => void;
  onRenameNode: (from: string[], to: string[]) => void;
  onDeleteNode: (path: string[], hasTopics: boolean) => void;
}

function healthUnder(ctx: Ctx, prefix: string[]): { count: number; health: HealthCounts } {
  const under = ctx.topics.filter((t) => pathStartsWith(t.path, prefix));
  return { count: under.length, health: ctx.hasCoverage ? healthOf(under, ctx.index) : emptyHealth() };
}

function InlineInput({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (v: string) => void;
  onCancel: () => void;
}): React.JSX.Element {
  const [v, setV] = useState(initial);
  return (
    <div className="seg-area editing">
      <input
        className="f"
        autoFocus
        placeholder="segment-name"
        value={v}
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

function NodeRow({ node, depth, ctx }: { node: TreeNode; depth: number; ctx: Ctx }): React.JSX.Element {
  const key = pathKey(node.path);
  const selected = pathKey(ctx.selectedPath) === key;
  const collapsed = ctx.collapsed[key] ?? false;
  const { count, health } = healthUnder(ctx, node.path);
  const isRenaming = ctx.editing?.mode === "rename" && pathKey(ctx.editing.path) === key;

  if (isRenaming) {
    return (
      <InlineInput
        initial={node.segment}
        onCancel={() => ctx.setEditing(null)}
        onCommit={(v) => {
          ctx.setEditing(null);
          if (v && v !== node.segment) ctx.onRenameNode(node.path, [...node.path.slice(0, -1), v]);
        }}
      />
    );
  }

  return (
    <>
      <div
        className={`seg-area${selected ? " sel" : ""}`}
        role="button"
        tabIndex={0}
        style={{ marginLeft: depth * 12 }}
        onClick={() => ctx.dispatch({ type: "selectPath", path: node.path })}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") ctx.dispatch({ type: "selectPath", path: node.path });
        }}
      >
        <div className="seg-top">
          {node.children.length > 0 ? (
            <button
              className="mini tw"
              type="button"
              title={collapsed ? "Expand" : "Collapse"}
              onClick={(e) => {
                e.stopPropagation();
                ctx.dispatch({ type: "toggleCollapse", path: node.path });
              }}
            >
              {collapsed ? "▸" : "▾"}
            </button>
          ) : (
            <span className="tw-spacer" />
          )}
          <span className="seg-name">{node.segment}</span>
          <span className="area-acts">
            <button
              className="mini"
              type="button"
              title="Add child node"
              onClick={(e) => {
                e.stopPropagation();
                ctx.setEditing({ mode: "create", parent: node.path });
              }}
            >
              ＋
            </button>
            <button
              className="mini"
              type="button"
              title="Rename / move node"
              onClick={(e) => {
                e.stopPropagation();
                ctx.setEditing({ mode: "rename", path: node.path });
              }}
            >
              ✎
            </button>
            <button
              className="mini"
              type="button"
              title="Delete node"
              onClick={(e) => {
                e.stopPropagation();
                ctx.onDeleteNode(node.path, count > 0);
              }}
            >
              ✕
            </button>
          </span>
          <span className="seg-count">{count}</span>
        </div>
        {ctx.hasCoverage ? <Meter counts={health} /> : null}
        <div className="seg-tags">
          <HealthTags counts={{ ...health, total: count }} hasCoverage={ctx.hasCoverage} />
        </div>
      </div>

      {ctx.editing?.mode === "create" && pathKey(ctx.editing.parent) === key ? (
        <div style={{ marginLeft: (depth + 1) * 12 }}>
          <InlineInput
            initial=""
            onCancel={() => ctx.setEditing(null)}
            onCommit={(v) => {
              ctx.setEditing(null);
              if (v) ctx.onCreateNode([...node.path, v]);
            }}
          />
        </div>
      ) : null}

      {!collapsed
        ? node.children.map((child) => <NodeRow key={pathKey(child.path)} node={child} depth={depth + 1} ctx={ctx} />)
        : null}
    </>
  );
}

export function PathTree(props: {
  nodes: NodeInfo[];
  manifest: Manifest | null;
  index: StatusIndex;
  hasCoverage: boolean;
  selectedPath: string[];
  collapsed: Record<string, boolean>;
  dispatch: Dispatch<Action>;
  onCreateNode: (path: string[]) => void;
  onRenameNode: (from: string[], to: string[]) => void;
  onDeleteNode: (path: string[], hasTopics: boolean) => void;
}): React.JSX.Element {
  const [editing, setEditing] = useState<Editing>(null);
  const tree = buildNodeTree(props.nodes);
  const topics = props.manifest?.topics ?? [];

  const ctx: Ctx = {
    topics,
    index: props.index,
    hasCoverage: props.hasCoverage,
    selectedPath: props.selectedPath,
    collapsed: props.collapsed,
    dispatch: props.dispatch,
    editing,
    setEditing,
    onCreateNode: props.onCreateNode,
    onRenameNode: props.onRenameNode,
    onDeleteNode: props.onDeleteNode,
  };

  const rootHealth = healthUnder(ctx, []);

  return (
    <aside className="spine">
      <div className="spine-scroll">
        <div className="spine-label">Taxonomy</div>
        <div
          className={`seg-area${props.selectedPath.length === 0 ? " sel" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => props.dispatch({ type: "selectPath", path: [] })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") props.dispatch({ type: "selectPath", path: [] });
          }}
        >
          <div className="seg-top">
            <span className="tw-spacer" />
            <span className="seg-name">all</span>
            <span className="seg-count">{rootHealth.count}</span>
          </div>
          {props.hasCoverage ? <Meter counts={rootHealth.health} /> : null}
          <div className="seg-tags">
            <HealthTags counts={{ ...rootHealth.health, total: rootHealth.count }} hasCoverage={props.hasCoverage} />
          </div>
        </div>

        {tree.map((node) => (
          <NodeRow key={pathKey(node.path)} node={node} depth={0} ctx={ctx} />
        ))}

        {editing?.mode === "create" && editing.parent.length === 0 ? (
          <InlineInput
            initial=""
            onCancel={() => setEditing(null)}
            onCommit={(v) => {
              setEditing(null);
              if (v) props.onCreateNode([v]);
            }}
          />
        ) : (
          <button className="seg-area add-area" type="button" onClick={() => setEditing({ mode: "create", parent: [] })}>
            <span className="seg-name">＋ new node</span>
          </button>
        )}
      </div>
    </aside>
  );
}

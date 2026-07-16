/**
 * TopicList — the author workspace. Shows the manifest topics under the selected path PREFIX, grouped
 * by full path with breadcrumb headers, each row showing id/title/kind and (when a coverage report is
 * loaded) a status pill keyed by `topicKey`. A text filter plus kind/status chips narrow the list;
 * clicking a row opens the editor.
 */
import type { Dispatch } from "react";

import {
  emptyHealth,
  groupByPath,
  healthOf,
  pathKey,
  visibleTopics,
  type Filters,
  type StatusBucket,
  type StatusIndex,
} from "../derive";
import type { Action } from "../state";
import type { Kind, Manifest, Topic } from "../types";
import { HealthTags, Meter, StatusPill } from "./common";

const KIND_CHIPS: { kind: Kind; label: string; cls: string }[] = [
  { kind: "real", label: "real", cls: "" },
  { kind: "canary", label: "canary", cls: "k-canary" },
];

const STATUS_CHIPS: { bucket: StatusBucket; label: string; cls: string }[] = [
  { bucket: "ok", label: "grounded", cls: "" },
  { bucket: "gap", label: "gap", cls: "" },
  { bucket: "caution", label: "caution", cls: "" },
  { bucket: "alarm", label: "alarm", cls: "k-canary" },
];

export function TopicList(props: {
  manifest: Manifest | null;
  manifestError: string | null;
  index: StatusIndex;
  hasCoverage: boolean;
  selectedPath: string[];
  query: string;
  kindFilter: Kind | null;
  statusFilter: StatusBucket | null;
  dispatch: Dispatch<Action>;
  onNewTopic: (kind: Kind) => void;
  onOpenTopic: (topic: Topic) => void;
}): React.JSX.Element {
  const { manifest, dispatch } = props;
  const filters: Filters = { query: props.query, kind: props.kindFilter, status: props.statusFilter };
  const topics = manifest?.topics ?? [];
  const visible = visibleTopics(topics, props.selectedPath, filters, props.index);
  const groups = groupByPath(visible);

  return (
    <section className="view">
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search topics…"
          value={props.query}
          onChange={(e) => dispatch({ type: "setQuery", query: e.target.value })}
        />
        <div className="chips">
          {KIND_CHIPS.map((c) => (
            <button
              key={c.kind}
              type="button"
              className={`chip ${c.cls}${props.kindFilter === c.kind ? " on" : ""}`}
              onClick={() => dispatch({ type: "toggleKindFilter", kind: c.kind })}
            >
              {c.label}
            </button>
          ))}
          {props.hasCoverage
            ? STATUS_CHIPS.map((c) => (
                <button
                  key={c.bucket}
                  type="button"
                  className={`chip ${c.cls}${props.statusFilter === c.bucket ? " on" : ""}`}
                  onClick={() => dispatch({ type: "toggleStatusFilter", bucket: c.bucket })}
                >
                  {c.label}
                </button>
              ))
            : null}
        </div>
        <div className="spacer" />
        <button className="btn sm" type="button" onClick={() => props.onNewTopic("real")}>
          ＋ New topic
        </button>
      </div>

      <div className="list">
        {props.manifestError ? (
          <div className="empty">
            <div className="big">Manifest invalid</div>
            <div className="err" style={{ whiteSpace: "pre-wrap" }}>
              {props.manifestError}
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="empty">
            <div className="big">{topics.length ? "No matches" : "No topics yet"}</div>
            {topics.length ? "Nothing matches the current search or filters." : "Press “＋ New topic” to author the first one."}
          </div>
        ) : (
          groups.map((g) => {
            const under = topics.filter((t) => pathKey(t.path) === pathKey(g.path));
            const health = props.hasCoverage ? healthOf(under, props.index) : emptyHealth();
            return (
              <div className="group" key={pathKey(g.path)}>
                <div className="group-head">
                  <span className="g-name">{g.path.join(" / ")}</span>
                  <span className="g-count">
                    {g.topics.length}
                    {g.topics.length !== under.length ? `/${String(under.length)}` : ""}
                  </span>
                  {props.hasCoverage ? (
                    <span className="g-health">
                      <span className="g-tags">
                        <HealthTags counts={health} hasCoverage />
                      </span>
                      <Meter counts={health} width="110px" />
                    </span>
                  ) : null}
                </div>
                {g.topics.map((t) => {
                  const result = props.index[[...t.path, t.id].join("/")];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`row${t.kind === "canary" ? " canary" : ""}`}
                      onClick={() => props.onOpenTopic(t)}
                    >
                      <span className="dot" />
                      <span className="r-main">
                        <span className="r-title">{t.title}</span>
                        <span className="r-id">{t.id}</span>
                      </span>
                      <span className={`r-kind ${t.kind}`}>{t.kind === "canary" ? "⚑ canary" : "real"}</span>
                      {props.hasCoverage ? (
                        result ? <StatusPill status={result.status} /> : <span className="pill s-none">no data</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

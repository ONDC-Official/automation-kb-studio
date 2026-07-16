/**
 * EditorSheet — the slide-in topic editor. Title, an auto-slugged/validated id, the PathPicker (ragged
 * taxonomy), a real/canary toggle, and a repeatable list of question phrasings (≥1). Save POSTs the
 * topic (with `previous` when the id or path changed → a move/rename). Duplicate, flip-kind, and delete
 * live in the footer. The dirty-guard before discarding is enforced by the parent (a `confirm`).
 */
import type { Dispatch } from "react";

import { topicKey, type StatusIndex } from "../derive";
import { validateEditor, type Action, type EditorState } from "../state";
import type { NodeInfo } from "../types";
import { PathPicker } from "./PathPicker";
import { StatusPill } from "./common";

const GUIDANCE_REAL =
  "A real topic is a genuine topic the source SHOULD answer. Give it ≥2 phrasings so the probe can measure self-consistency across wordings.";
const GUIDANCE_CANARY =
  "A canary is a FABRICATED topic that does NOT exist in the subject — an invented verb, header, enum, or version. A well-grounded source abstains; a confabulator answers it confidently, which is the alarm that its confident answers to real topics are worth nothing either.";

export function EditorSheet(props: {
  editor: EditorState;
  nodes: NodeInfo[];
  levels: string[];
  index: StatusIndex;
  hasCoverage: boolean;
  dispatch: Dispatch<Action>;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}): React.JSX.Element {
  const { editor: e, dispatch } = props;
  const editing = e.original !== null;
  const idValid = /^[a-z0-9][a-z0-9-]*$/.test(e.id);
  const result = e.original ? props.index[topicKey(e.original)] : undefined;
  const errs = validateEditor(e);

  return (
    <>
      <div className="scrim on" onClick={props.onClose} />
      <aside className="editor open">
        <div className="editor-head">
          <div className={`editor-eyebrow${e.kind === "canary" ? " canary" : ""}`}>
            {editing ? "Edit topic" : e.kind === "canary" ? "New canary" : "New topic"}
          </div>
          <div className="spacer" />
          <button className="icon-btn" type="button" title="Close" onClick={props.onClose}>
            ✕
          </button>
        </div>

        <div className="editor-body">
          <label>Title</label>
          <input
            className="f f-title"
            placeholder="Validity of an on_search response"
            value={e.title}
            onChange={(ev) => dispatch({ type: "editorField", field: "title", value: ev.target.value })}
          />

          <label>id</label>
          <div className="id-line">
            <input
              className="f"
              placeholder="on-search-validation"
              value={e.id}
              onChange={(ev) => dispatch({ type: "editorField", field: "id", value: ev.target.value })}
            />
            <span className="hint">{idValid || !e.id ? "lowercase-dashes — the filename & stable key" : "invalid id"}</span>
          </div>

          <label>Path</label>
          <PathPicker
            path={e.path}
            nodes={props.nodes}
            levels={props.levels}
            onChange={(path) => dispatch({ type: "editorSetPath", path })}
          />

          <label>Kind</label>
          <div className="kind-switch">
            {(["real", "canary"] as const).map((k) => (
              <button
                key={k}
                type="button"
                data-kind={k}
                className={e.kind === k ? "on" : ""}
                onClick={() => dispatch({ type: "editorSetKind", kind: k })}
              >
                {k}
              </button>
            ))}
          </div>

          <label>
            Phrasings{" "}
            <span className="hint">{e.kind === "real" ? "(≥2 recommended — the probe checks consistency across wordings)" : ""}</span>
          </label>
          <div>
            {e.questions.map((q, i) => (
              <div className="q-row" key={i}>
                <span className="q-index">{i + 1}</span>
                <textarea
                  className="f q-input"
                  rows={1}
                  placeholder="A question phrasing…"
                  value={q}
                  onChange={(ev) => dispatch({ type: "editorSetQuestion", index: i, value: ev.target.value })}
                />
                <div className="q-tools">
                  <button className="mini" type="button" title="Move up" disabled={i === 0} onClick={() => dispatch({ type: "editorMoveQuestion", index: i, delta: -1 })}>
                    ▲
                  </button>
                  <button
                    className="mini"
                    type="button"
                    title="Move down"
                    disabled={i === e.questions.length - 1}
                    onClick={() => dispatch({ type: "editorMoveQuestion", index: i, delta: 1 })}
                  >
                    ▼
                  </button>
                  <button className="mini" type="button" title="Remove" onClick={() => dispatch({ type: "editorRemoveQuestion", index: i })}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="btn ghost sm" type="button" onClick={() => dispatch({ type: "editorAddQuestion" })}>
            ＋ Add phrasing
          </button>

          <div className={`guidance${e.kind === "canary" ? "" : " dim"}`}>{e.kind === "canary" ? GUIDANCE_CANARY : GUIDANCE_REAL}</div>

          {props.hasCoverage && result ? (
            <div className="cov-inline">
              <div className="ci-head">
                latest coverage <StatusPill status={result.status} />
                <span style={{ marginLeft: "auto" }}>agreement {result.agreement.toFixed(2)}</span>
              </div>
              {result.detail ? <div className="ci-sample">{result.detail}</div> : null}
              {result.sample ? <div className="ci-sample" style={{ marginTop: 6 }}>“{result.sample}”</div> : null}
            </div>
          ) : null}

          {e.error ? <div className="err">{e.error}</div> : null}
        </div>

        <div className="editor-foot">
          <button className="btn" type="button" disabled={errs.length > 0} onClick={props.onSave}>
            Save topic
          </button>
          {editing ? (
            <>
              <button className="btn subtle sm" type="button" title="Duplicate" onClick={() => dispatch({ type: "editorDuplicate" })}>
                Duplicate
              </button>
              <button className="btn subtle sm" type="button" title="Flip real/canary" onClick={() => dispatch({ type: "editorFlipKind" })}>
                Flip kind
              </button>
              <div className="spacer" />
              <button className="btn danger sm" type="button" onClick={props.onDelete}>
                Delete
              </button>
            </>
          ) : null}
        </div>
      </aside>
    </>
  );
}

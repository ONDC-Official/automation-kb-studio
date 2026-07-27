import { useState } from "react";
import { ChevronUp, X } from "lucide-react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import StatusBadge from "@/components/StatusBadge";
import { TOPIC_ID_RE, topicKey, type StatusIndex } from "@/lib/derive";
import { cn } from "@/lib/utils";
import { validateEditor, type EditorState } from "./editors";
import type { EditorsApi } from "./useEditors";

/** The inline (accordion) topic editor. Autosaves; no Save button — the footer shows the live state. */
const TopicEditor = ({
  editor: e,
  index,
  canDelete,
  api,
}: {
  editor: EditorState;
  index: StatusIndex;
  hasCoverage: boolean;
  canDelete: boolean;
  api: EditorsApi;
}) => {
  const eid = e.eid;
  const editing = e.original !== null;
  const idValid = TOPIC_ID_RE.test(e.id);
  const result = e.original ? index[topicKey(e.original)] : undefined;
  const errs = validateEditor(e);
  const pending = e.saving || (e.dirty && errs.length === 0);
  const saveLabel = pending ? "Saving…" : errs.length ? `Can't save — ${errs[0] ?? "incomplete"}` : "Saved";

  const [draft, setDraft] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const phrases = e.questions.filter((q) => q.trim().length > 0);
  const commit = (arr: string[]): void => api.setQuestions(eid, arr.length ? arr : [""]);

  const addDraft = (): void => {
    const v = draft.trim();
    if (!v) return;
    commit([...phrases, v]);
    setDraft("");
  };
  const removeAt = (i: number): void => {
    if (editIndex === i) setEditIndex(null);
    commit(phrases.filter((_, j) => j !== i));
  };
  const commitEdit = (i: number): void => {
    const v = editValue.trim();
    commit(v ? phrases.map((p, j) => (j === i ? v : p)) : phrases.filter((_, j) => j !== i));
    setEditIndex(null);
  };

  return (
    <div className="anim-expand">
      <div className="flex flex-col gap-2 rounded-md border border-accent-400 bg-surface p-3">
      <button
        type="button"
        onClick={() => api.close(eid)}
        className="flex items-center gap-1 self-start text-xs text-neutral-500 hover:text-foreground"
      >
        <ChevronUp className="size-3.5" /> Collapse
      </button>

      {e.conflict && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-warn/15 px-2 py-1.5 text-xs text-warn">
          <span>This topic changed on the server since you opened it — autosave paused.</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => api.takeTheirs(eid)}>
              Take theirs
            </Button>
            <Button size="sm" variant="destructive" onClick={() => api.keepMine(eid)}>
              Keep mine
            </Button>
          </div>
        </div>
      )}

      {result && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
          <StatusBadge status={result.status} />
          <span>{result.detail || "Not yet probed."}</span>
          <span className="ml-auto tabular-nums">{result.agreement.toFixed(2)} agree</span>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-48 grow flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">Title</span>
          <Input
            placeholder="Validity of an on_search response"
            value={e.title}
            onChange={(ev) => api.setField(eid, "title", ev.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">ID</span>
          <Input
            className={cn("font-mono", !idValid && e.id && "border-error")}
            placeholder="on-search-validation"
            title="lowercase-dashes — the filename & stable key"
            value={e.id}
            onChange={(ev) => api.setField(eid, "id", ev.target.value)}
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-neutral-600">Kind</span>
          <div className="flex overflow-hidden rounded-md border border-border">
            {(["real", "canary"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => api.setKind(eid, k)}
                className={cn(
                  "px-2.5 py-1.5 text-xs",
                  e.kind === k ? "bg-accent-600 text-neutral-100" : "bg-surface text-neutral-600 hover:bg-neutral-200",
                )}
              >
                {k === "real" ? "● Real" : "◆ Canary"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {!idValid && e.id && <div className="text-xs text-error">invalid id — lowercase letters, digits, and dashes only</div>}

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-600">
          Probe questions{" "}
          <span className="font-normal text-neutral-500">
            {e.kind === "real" ? "≥2 checks consistency across wordings" : "an invented topic to catch confident guessing"}
          </span>
        </span>
        <span className="text-xs text-neutral-500">
          {phrases.length} phrasing{phrases.length === 1 ? "" : "s"}
        </span>
      </div>

      <Input
        placeholder="Type a phrasing, press ↵"
        value={draft}
        onChange={(ev) => setDraft(ev.target.value)}
        onKeyDown={(ev) => {
          if (ev.key === "Enter") {
            ev.preventDefault();
            addDraft();
          }
        }}
      />

      {phrases.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {phrases.map((q, i) =>
            editIndex === i ? (
              <input
                key={i}
                autoFocus
                className="rounded-sm border border-accent-400 bg-background px-1.5 py-0.5 text-xs"
                value={editValue}
                onChange={(ev) => setEditValue(ev.target.value)}
                onBlur={() => commitEdit(i)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") {
                    ev.preventDefault();
                    commitEdit(i);
                  } else if (ev.key === "Escape") {
                    setEditIndex(null);
                  }
                }}
              />
            ) : (
              <span key={i} className="flex items-center gap-1 rounded-sm bg-neutral-200 py-0.5 pr-1 pl-2 text-xs">
                <button
                  type="button"
                  title="Click to edit"
                  className="max-w-xs truncate"
                  onClick={() => {
                    setEditIndex(i);
                    setEditValue(phrases[i] ?? "");
                  }}
                >
                  {q}
                </button>
                <button type="button" title="Remove" className="text-neutral-500 hover:text-error" onClick={() => removeAt(i)}>
                  <X className="size-3" />
                </button>
              </span>
            ),
          )}
        </div>
      )}

      {e.error && <div className="text-xs text-error">{e.error}</div>}

      <div className="flex items-center gap-2 pt-1">
        <span className={cn("flex items-center gap-1 text-xs", pending ? "text-accent-700" : errs.length ? "text-warn" : "text-ok")}>
          {saveLabel}
        </span>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="subtle" title="Duplicate as a new topic" onClick={() => api.duplicate(eid)}>
            Duplicate
          </Button>
          {editing && canDelete && (
            <Button size="sm" variant="destructive" onClick={() => api.deleteTopic(eid)}>
              Delete
            </Button>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default TopicEditor;

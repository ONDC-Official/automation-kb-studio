/**
 * The topic-editor working-copy model + its pure reducer. Ported from the old global `state.ts` editor
 * slice; kept pure (no React, no I/O) so the multi-editor autosave machine in `useEditors.ts` can fold
 * over it and be reasoned about directly. Several editors are open at once, keyed by a client `eid`, each
 * autosaving independently.
 */
import { slug, TOPIC_ID_RE, topicKey } from "@/lib/derive";
import type { Kind, Topic } from "@/services/types";

export interface EditorState {
  eid: string;
  /** The identity currently on disk — null for a brand-new draft until its first successful save. */
  original: { path: string[]; id: string } | null;
  title: string;
  id: string;
  idEdited: boolean;
  path: string[];
  kind: Kind;
  questions: string[];
  dirty: boolean;
  saving: boolean;
  error: string | null;
  /** Content version this editor was opened/last-saved from — sent as `baseVersion` so a stale save 409s. */
  baseVersion: string | null;
  /** Set when a save 409'd: the server's current copy, offered as "take theirs". */
  conflict: { theirs: Topic; theirVersion: string } | null;
}

export interface EditorsState {
  editors: Record<string, EditorState>;
  nextId: number;
}

export const initialEditors: EditorsState = { editors: {}, nextId: 1 };

export type EditorsAction =
  | { type: "openEdit"; topic: Topic; version: string | null }
  | { type: "openNew"; kind: Kind; path: string[] }
  | { type: "field"; eid: string; field: "title" | "id"; value: string }
  | { type: "setKind"; eid: string; kind: Kind }
  | { type: "setQuestions"; eid: string; questions: string[] }
  | { type: "saving"; eid: string; saving: boolean }
  | { type: "saved"; eid: string; identity: { path: string[]; id: string }; version: string | null }
  | { type: "error"; eid: string; error: string | null }
  | { type: "conflict"; eid: string; theirs: Topic; theirVersion: string }
  | { type: "resolveKeepMine"; eid: string }
  | { type: "resolveTakeTheirs"; eid: string }
  | { type: "duplicate"; eid: string }
  | { type: "close"; eid: string };

function editorFor(eid: string, topic: Topic, baseVersion: string | null): EditorState {
  return {
    eid,
    original: { path: topic.path, id: topic.id },
    title: topic.title,
    id: topic.id,
    idEdited: true,
    path: topic.path,
    kind: topic.kind,
    questions: topic.questions.length ? topic.questions : [""],
    dirty: false,
    saving: false,
    error: null,
    baseVersion,
    conflict: null,
  };
}

function newEditor(eid: string, kind: Kind, path: string[]): EditorState {
  return {
    eid,
    original: null,
    title: "",
    id: "",
    idEdited: false,
    path,
    kind,
    questions: [""],
    dirty: false,
    saving: false,
    error: null,
    baseVersion: null,
    conflict: null,
  };
}

/** The `eid` of an already-open editor for this on-disk topic, if any (so re-opening focuses it). */
function openEidFor(state: EditorsState, topic: Topic): string | null {
  const key = topicKey(topic);
  for (const [eid, e] of Object.entries(state.editors)) {
    if (e.original && topicKey(e.original) === key) return eid;
  }
  return null;
}

function patch(state: EditorsState, eid: string, p: Partial<EditorState>, markDirty = true): EditorsState {
  const e = state.editors[eid];
  if (!e) return state;
  const next = markDirty ? { ...e, ...p, dirty: true, error: null } : { ...e, ...p };
  return { ...state, editors: { ...state.editors, [eid]: next } };
}

export function editorsReducer(state: EditorsState, action: EditorsAction): EditorsState {
  switch (action.type) {
    case "openEdit": {
      if (openEidFor(state, action.topic)) return state;
      const eid = `e${String(state.nextId)}`;
      return { editors: { ...state.editors, [eid]: editorFor(eid, action.topic, action.version) }, nextId: state.nextId + 1 };
    }
    case "openNew": {
      const eid = `e${String(state.nextId)}`;
      return { editors: { ...state.editors, [eid]: newEditor(eid, action.kind, action.path) }, nextId: state.nextId + 1 };
    }
    case "field": {
      const e = state.editors[action.eid];
      if (!e) return state;
      if (action.field === "title") {
        const id = e.idEdited ? e.id : slug(action.value); // auto-slug until the id is hand-edited
        return patch(state, action.eid, { title: action.value, id });
      }
      return patch(state, action.eid, { id: action.value, idEdited: true });
    }
    case "setKind":
      return patch(state, action.eid, { kind: action.kind });
    case "setQuestions":
      return patch(state, action.eid, { questions: action.questions });
    case "saving":
      return patch(state, action.eid, { saving: action.saving }, false);
    case "saved":
      return patch(
        state,
        action.eid,
        { original: action.identity, baseVersion: action.version, saving: false, dirty: false, error: null, conflict: null },
        false,
      );
    case "error":
      return patch(state, action.eid, { saving: false, error: action.error }, false);
    case "conflict":
      return patch(state, action.eid, { saving: false, conflict: { theirs: action.theirs, theirVersion: action.theirVersion } }, false);
    case "resolveKeepMine": {
      const e = state.editors[action.eid];
      if (!e?.conflict) return state;
      return patch(state, action.eid, { baseVersion: e.conflict.theirVersion, conflict: null, dirty: true, error: null }, false);
    }
    case "resolveTakeTheirs": {
      const e = state.editors[action.eid];
      if (!e?.conflict) return state;
      const t = e.conflict.theirs;
      return patch(
        state,
        action.eid,
        {
          title: t.title,
          id: t.id,
          idEdited: true,
          path: t.path,
          kind: t.kind,
          questions: t.questions.length ? t.questions : [""],
          baseVersion: e.conflict.theirVersion,
          conflict: null,
          dirty: false,
          error: null,
        },
        false,
      );
    }
    case "duplicate": {
      const src = state.editors[action.eid];
      if (!src) return state;
      const base = src.id || slug(src.title) || "topic";
      const eid = `e${String(state.nextId)}`;
      const copy: EditorState = {
        ...src,
        eid,
        original: null,
        id: `${base}-copy`.slice(0, 60),
        idEdited: true,
        dirty: true,
        saving: false,
        error: null,
        baseVersion: null,
        conflict: null,
      };
      return { editors: { ...state.editors, [eid]: copy }, nextId: state.nextId + 1 };
    }
    case "close": {
      if (!state.editors[action.eid]) return state;
      const editors = { ...state.editors };
      delete editors[action.eid];
      return { ...state, editors };
    }
  }
}

/** Validate the editor's working topic client-side (mirrors the server's guards). Returns errors. */
export function validateEditor(e: EditorState): string[] {
  const errs: string[] = [];
  if (!TOPIC_ID_RE.test(e.id)) errs.push("id must be lowercase letters, digits, and dashes (no dots).");
  if (e.path.length === 0) errs.push("a topic needs at least one path segment.");
  if (!e.title.trim()) errs.push("title is required.");
  if (e.questions.filter((q) => q.trim()).length === 0) errs.push("at least one phrasing is required.");
  return errs;
}

/** The topic payload the editor would POST (trimmed, empty phrasings dropped). */
export function editorTopic(e: EditorState): Topic {
  return {
    id: e.id.trim(),
    path: e.path,
    title: e.title.trim(),
    kind: e.kind,
    questions: e.questions.map((q) => q.trim()).filter(Boolean),
  };
}

/** Did the editor's identity move? Only the id can change, so a changed id means a rename (`previous`). */
export function editorMoved(e: EditorState): boolean {
  if (!e.original) return false;
  return e.original.id !== e.id.trim();
}

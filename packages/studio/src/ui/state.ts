/**
 * The KB Studio brain. Pure — no React, no DOM, no `fetch`, no `Date.now()`. Every async result (a
 * loaded manifest, a coverage report, a saved topic) enters as an ACTION dispatched by `App.tsx`, so
 * the whole UI is a fold over a list of actions and can be replayed and asserted without a renderer.
 * This mirrors the discipline of `packages/tui/src/state.ts`.
 *
 * The reducer owns view/selection/filters/editor/toast AND the loaded data snapshots (manifest, nodes,
 * runs, reports) — it just stores what App hands it. Side effects (network, timers, confirms, the DOM,
 * the clock) all live in App/hooks; the reducer never performs one.
 */
import { slug, TOPIC_ID_RE, type StatusBucket } from "./derive";
import type {
  CoverageReportWithTree,
  CoverageSummary,
  Kind,
  Manifest,
  NodeInfo,
  Topic,
} from "./types";

export type View = "author" | "coverage";

/** The topic editor's working copy. `original` is null for a brand-new topic; when it differs from
 *  the current {path,id} on save, App sends `previous` and the server performs a move/rename. */
export interface EditorState {
  original: { path: string[]; id: string } | null;
  title: string;
  id: string;
  idEdited: boolean;
  path: string[];
  kind: Kind;
  questions: string[];
  dirty: boolean;
  error: string | null;
}

export interface Toast {
  id: number;
  message: string;
  kind: "info" | "error";
}

export interface State {
  view: View;

  // Loaded data snapshots (App dispatches these after I/O).
  manifest: Manifest | null;
  manifestError: string | null;
  nodes: NodeInfo[];
  runs: CoverageSummary[];
  reports: Record<string, CoverageReportWithTree>;

  // Author view: selection + filters.
  selectedPath: string[]; // [] === the "All" root
  collapsed: Record<string, boolean>; // node path.join("/") → collapsed
  query: string;
  kindFilter: Kind | null;
  statusFilter: StatusBucket | null;

  editor: EditorState | null;

  // Coverage view: which run(s) are shown.
  runA: string | null; // file
  runB: string | null; // file (compare) or null

  toast: Toast | null;
  theme: "light" | "dark" | null; // null === follow the system

  nextId: number;
}

export function initialState(): State {
  return {
    view: "author",
    manifest: null,
    manifestError: null,
    nodes: [],
    runs: [],
    reports: {},
    selectedPath: [],
    collapsed: {},
    query: "",
    kindFilter: null,
    statusFilter: null,
    editor: null,
    runA: null,
    runB: null,
    toast: null,
    theme: null,
    nextId: 1,
  };
}

export type Action =
  | { type: "setView"; view: View }
  | { type: "manifestLoaded"; manifest: Manifest }
  | { type: "manifestError"; error: string }
  | { type: "nodesLoaded"; nodes: NodeInfo[] }
  | { type: "runsLoaded"; runs: CoverageSummary[] }
  | { type: "reportLoaded"; file: string; report: CoverageReportWithTree }
  // author selection / filters
  | { type: "selectPath"; path: string[] }
  | { type: "toggleCollapse"; path: string[] }
  | { type: "setQuery"; query: string }
  | { type: "toggleKindFilter"; kind: Kind }
  | { type: "toggleStatusFilter"; bucket: StatusBucket }
  // editor
  | { type: "openEditorEdit"; topic: Topic }
  | { type: "openEditorNew"; kind: Kind; path: string[] }
  | { type: "editorField"; field: "title" | "id"; value: string }
  | { type: "editorSetKind"; kind: Kind }
  | { type: "editorSetPath"; path: string[] }
  | { type: "editorAddQuestion" }
  | { type: "editorSetQuestion"; index: number; value: string }
  | { type: "editorRemoveQuestion"; index: number }
  | { type: "editorMoveQuestion"; index: number; delta: 1 | -1 }
  | { type: "editorError"; error: string | null }
  | { type: "editorDuplicate" }
  | { type: "editorFlipKind" }
  | { type: "closeEditor" }
  // coverage
  | { type: "selectRun"; slot: "a" | "b"; file: string | null }
  // chrome
  | { type: "toast"; message: string; kind: "info" | "error" }
  | { type: "dismissToast" }
  | { type: "setTheme"; theme: "light" | "dark" | null };

function editorFor(topic: Topic): EditorState {
  return {
    original: { path: topic.path, id: topic.id },
    title: topic.title,
    id: topic.id,
    idEdited: true,
    path: topic.path,
    kind: topic.kind,
    questions: topic.questions.length ? topic.questions : [""],
    dirty: false,
    error: null,
  };
}

function newEditor(kind: Kind, path: string[]): EditorState {
  return {
    original: null,
    title: "",
    id: "",
    idEdited: false,
    path,
    kind,
    questions: [""],
    dirty: false,
    error: null,
  };
}

/** Apply an editor sub-update and mark it dirty + clear any stale error. */
function editEditor(state: State, patch: Partial<EditorState>): State {
  if (!state.editor) return state;
  return { ...state, editor: { ...state.editor, ...patch, dirty: true, error: null } };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setView":
      return { ...state, view: action.view };

    case "manifestLoaded":
      return { ...state, manifest: action.manifest, manifestError: null };

    case "manifestError":
      return { ...state, manifest: null, manifestError: action.error };

    case "nodesLoaded":
      return { ...state, nodes: action.nodes };

    case "runsLoaded": {
      const first = action.runs[0]?.file ?? null;
      // Default run A to the newest run when nothing is selected yet (or the selection vanished).
      const runA = state.runA && action.runs.some((r) => r.file === state.runA) ? state.runA : first;
      const runB = state.runB && action.runs.some((r) => r.file === state.runB) ? state.runB : null;
      return { ...state, runs: action.runs, runA, runB };
    }

    case "reportLoaded":
      return { ...state, reports: { ...state.reports, [action.file]: action.report } };

    case "selectPath":
      return { ...state, selectedPath: action.path };

    case "toggleCollapse": {
      const k = action.path.join("/");
      return { ...state, collapsed: { ...state.collapsed, [k]: !state.collapsed[k] } };
    }

    case "setQuery":
      return { ...state, query: action.query };

    case "toggleKindFilter":
      return { ...state, kindFilter: state.kindFilter === action.kind ? null : action.kind };

    case "toggleStatusFilter":
      return { ...state, statusFilter: state.statusFilter === action.bucket ? null : action.bucket };

    case "openEditorEdit":
      return { ...state, editor: editorFor(action.topic) };

    case "openEditorNew":
      return { ...state, editor: newEditor(action.kind, action.path) };

    case "editorField": {
      if (!state.editor) return state;
      if (action.field === "title") {
        // Auto-slug the id from the title until the id has been hand-edited.
        const id = state.editor.idEdited ? state.editor.id : slug(action.value);
        return editEditor(state, { title: action.value, id });
      }
      return editEditor(state, { id: action.value, idEdited: true });
    }

    case "editorSetKind":
      return editEditor(state, { kind: action.kind });

    case "editorSetPath":
      return editEditor(state, { path: action.path });

    case "editorAddQuestion":
      if (!state.editor) return state;
      return editEditor(state, { questions: [...state.editor.questions, ""] });

    case "editorSetQuestion": {
      if (!state.editor) return state;
      const questions = state.editor.questions.map((q, i) => (i === action.index ? action.value : q));
      return editEditor(state, { questions });
    }

    case "editorRemoveQuestion": {
      if (!state.editor) return state;
      const questions = state.editor.questions.filter((_, i) => i !== action.index);
      return editEditor(state, { questions: questions.length ? questions : [""] });
    }

    case "editorMoveQuestion": {
      if (!state.editor) return state;
      const j = action.index + action.delta;
      const qs = state.editor.questions;
      if (j < 0 || j >= qs.length) return state;
      const questions = [...qs];
      const a = questions[action.index];
      const b = questions[j];
      if (a === undefined || b === undefined) return state;
      questions[action.index] = b;
      questions[j] = a;
      return editEditor(state, { questions });
    }

    case "editorError":
      if (!state.editor) return state;
      return { ...state, editor: { ...state.editor, error: action.error } };

    case "editorDuplicate": {
      if (!state.editor) return state;
      const base = state.editor.id || slug(state.editor.title) || "topic";
      return {
        ...state,
        editor: {
          ...state.editor,
          original: null, // saving now creates a new file
          id: `${base}-copy`.slice(0, 60),
          idEdited: true,
          dirty: true,
          error: null,
        },
      };
    }

    case "editorFlipKind":
      return editEditor(state, { kind: state.editor?.kind === "canary" ? "real" : "canary" });

    case "closeEditor":
      return { ...state, editor: null };

    case "selectRun":
      return action.slot === "a" ? { ...state, runA: action.file } : { ...state, runB: action.file };

    case "toast":
      return { ...state, toast: { id: state.nextId, message: action.message, kind: action.kind }, nextId: state.nextId + 1 };

    case "dismissToast":
      return { ...state, toast: null };

    case "setTheme":
      return { ...state, theme: action.theme };
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

/** Did the editor's identity move? (a changed path or id means the save is a rename/move). */
export function editorMoved(e: EditorState): boolean {
  if (!e.original) return false;
  return e.original.id !== e.id.trim() || e.original.path.join("/") !== e.path.join("/");
}

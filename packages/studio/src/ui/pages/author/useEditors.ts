/**
 * The multi-editor autosave machine. Ported from the old App.tsx `flushSave` + autosave effect: one
 * debounce timer per open editor; "needs a write" is (current payload !== last-saved payload), tracked in
 * a ref so an in-flight save can't clobber edits made while it ran. A changed id renames via `previous`;
 * `baseVersion` is the optimistic-concurrency token — a 409 pauses that editor and raises a conflict banner.
 * Server writes go through the `useSaveTopic`/`useDeleteTopic` mutations (which invalidate manifest+nodes).
 */
import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";

import type { ApiError } from "@/services/httpClient";
import type { Kind, Topic } from "@/services/types";
import { useDeleteTopic, useSaveTopic } from "@/hooks/useTopics";
import { editorMoved, editorsReducer, editorTopic, initialEditors, validateEditor, type EditorState } from "./editors";

export interface EditorsApi {
  editors: EditorState[];
  openEdit: (topic: Topic, version: string | null) => void;
  openNew: (kind: Kind, path: string[]) => void;
  setField: (eid: string, field: "title" | "id", value: string) => void;
  setKind: (eid: string, kind: Kind) => void;
  setQuestions: (eid: string, questions: string[]) => void;
  duplicate: (eid: string) => void;
  close: (eid: string) => void;
  keepMine: (eid: string) => void;
  takeTheirs: (eid: string) => void;
  deleteTopic: (eid: string) => void;
}

export function useEditors(): EditorsApi {
  const [state, dispatch] = useReducer(editorsReducer, initialEditors);
  const saveTopic = useSaveTopic();
  const deleteTopicMut = useDeleteTopic();

  // Latest editors snapshot for the debounce callback, without re-arming timers on every keystroke.
  const stateRef = useRef(state);
  stateRef.current = state;
  const saveTimers = useRef<Map<string, number>>(new Map());
  const savedPayload = useRef<Map<string, string>>(new Map());

  const flushSave = useCallback(
    async (eid: string): Promise<void> => {
      const e = stateRef.current.editors[eid];
      // Never autosave over an unresolved conflict — the user must pick Keep mine / Take theirs first.
      if (!e || e.saving || e.conflict || validateEditor(e).length) return;
      const topic = editorTopic(e);
      const payload = JSON.stringify(topic);
      if (savedPayload.current.get(eid) === payload) return; // nothing new since the last good save
      dispatch({ type: "saving", eid, saving: true });
      try {
        const resp = await saveTopic.mutateAsync({
          topic,
          ...(editorMoved(e) && e.original ? { previous: e.original } : {}),
          baseVersion: e.baseVersion,
        });
        savedPayload.current.set(eid, payload);
        dispatch({ type: "saved", eid, identity: { path: topic.path, id: topic.id }, version: resp.version ?? null });
      } catch (err) {
        const ae = err as ApiError;
        const b = ae.body as { current?: Topic; currentVersion?: string } | undefined;
        // Remember the doomed/conflicting payload so we don't hammer the server; a further edit retries.
        savedPayload.current.set(eid, payload);
        if (ae.status === 409 && b?.current && b.currentVersion) {
          dispatch({ type: "conflict", eid, theirs: b.current, theirVersion: b.currentVersion });
          return;
        }
        dispatch({ type: "error", eid, error: ae.message });
      }
    },
    [saveTopic],
  );

  useEffect(() => {
    for (const [eid, e] of Object.entries(state.editors)) {
      if (e.saving || e.conflict || validateEditor(e).length) continue; // a conflict pauses autosave until resolved
      const payload = JSON.stringify(editorTopic(e));
      if (savedPayload.current.get(eid) === payload) continue;
      // A just-opened, untouched existing topic is already on disk — seed its baseline, don't re-write it.
      if (!savedPayload.current.has(eid) && !e.dirty) {
        savedPayload.current.set(eid, payload);
        continue;
      }
      const prev = saveTimers.current.get(eid);
      if (prev !== undefined) window.clearTimeout(prev);
      saveTimers.current.set(
        eid,
        window.setTimeout(() => {
          saveTimers.current.delete(eid);
          void flushSave(eid);
        }, 700),
      );
    }
    // Drop pending timers for editors that have since closed.
    for (const eid of [...saveTimers.current.keys()]) {
      if (!state.editors[eid]) {
        window.clearTimeout(saveTimers.current.get(eid));
        saveTimers.current.delete(eid);
      }
    }
  }, [state.editors, flushSave]);

  const close = useCallback((eid: string): void => {
    const e = stateRef.current.editors[eid];
    // With autosave the only unsaved state is one that can't be saved (still invalid) — warn first.
    if (e?.dirty && validateEditor(e).length && !window.confirm("This topic isn't valid yet, so it hasn't been saved. Discard it?"))
      return;
    dispatch({ type: "close", eid });
  }, []);

  const keepMine = useCallback((eid: string): void => {
    dispatch({ type: "resolveKeepMine", eid });
    savedPayload.current.delete(eid); // force the autosave loop to re-fire and push my version
  }, []);

  const takeTheirs = useCallback((eid: string): void => {
    const e = stateRef.current.editors[eid];
    if (!e?.conflict) return;
    const t = e.conflict.theirs;
    dispatch({ type: "resolveTakeTheirs", eid });
    // The editor now matches the server, so record that payload as saved (no spurious re-write).
    savedPayload.current.set(eid, JSON.stringify({ id: t.id, path: t.path, title: t.title, kind: t.kind, questions: t.questions }));
  }, []);

  const deleteTopic = useCallback(
    async (eid: string): Promise<void> => {
      const e = stateRef.current.editors[eid];
      if (!e) return;
      if (!e.original) {
        dispatch({ type: "close", eid }); // a never-saved draft: just drop it, nothing on disk
        return;
      }
      if (!window.confirm(`Delete ${e.original.id}?`)) return;
      try {
        await deleteTopicMut.mutateAsync({ path: e.original.path, id: e.original.id });
        toast.success(`deleted ${e.original.id}`);
        savedPayload.current.delete(eid);
        dispatch({ type: "close", eid });
      } catch (err) {
        toast.error((err as ApiError).message);
      }
    },
    [deleteTopicMut],
  );

  return {
    editors: Object.values(state.editors),
    openEdit: (topic, version) => dispatch({ type: "openEdit", topic, version }),
    openNew: (kind, path) => dispatch({ type: "openNew", kind, path }),
    setField: (eid, field, value) => dispatch({ type: "field", eid, field, value }),
    setKind: (eid, kind) => dispatch({ type: "setKind", eid, kind }),
    setQuestions: (eid, questions) => dispatch({ type: "setQuestions", eid, questions }),
    duplicate: (eid) => dispatch({ type: "duplicate", eid }),
    close,
    keepMine,
    takeTheirs,
    deleteTopic: (eid) => void deleteTopic(eid),
  };
}

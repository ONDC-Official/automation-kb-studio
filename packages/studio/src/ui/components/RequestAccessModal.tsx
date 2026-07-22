/**
 * RequestAccessModal — a viewer's entry point to ask for write access. The viewer ticks the taxonomy
 * path(s) they want to edit (prefilled from their current selection) and adds an optional note; the
 * request lands in the admin's queue (`POST /api/access-requests`). If they already have an open
 * request, it shows that pending state and lets them update it. Purely presentational — the submit is a
 * callback.
 */
import { useState } from "react";

import type { AccessRequest, NodeInfo } from "../types";

const pathKey = (p: string[]): string => p.join("/");
const pathLabel = (p: string[]): string => (p.length ? p.join(" / ") : "root · everything");

export function RequestAccessModal({
  nodes,
  initialPaths,
  pending,
  onSubmit,
  onClose,
}: {
  nodes: NodeInfo[];
  initialPaths: string[][];
  pending: AccessRequest | null;
  onSubmit: (paths: string[][], note: string) => void;
  onClose: () => void;
}): React.JSX.Element {
  // Seed from an existing request if there is one, else the current selection.
  const [picked, setPicked] = useState<Set<string>>(() => new Set((pending?.paths ?? initialPaths).map(pathKey)));
  const [note, setNote] = useState(pending?.note ?? "");

  const byKey = new Map<string, string[]>(nodes.map((n) => [pathKey(n.path), n.path]));
  const toggle = (key: string): void => {
    const next = new Set(picked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setPicked(next);
  };

  const submit = (): void => {
    const paths = [...picked].map((k) => byKey.get(k)).filter((p): p is string[] => p !== undefined);
    if (paths.length === 0) {
      window.alert("Pick at least one path to request access to.");
      return;
    }
    onSubmit(paths, note.trim());
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="history-panel" role="dialog" aria-label="Request access" onClick={(e) => e.stopPropagation()}>
        <div className="history-head">
          <strong>Request edit access</strong>
          <button className="icon-btn" type="button" title="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="review-actions">
          {pending ? (
            <div className="banner" style={{ marginBottom: 4 }}>
              You have a pending request. Updating it replaces the paths and note below.
            </div>
          ) : (
            <div className="review-branch">You’re a read-only viewer. Choose the area(s) you need to edit and an admin will review your request.</div>
          )}
        </div>

        <div className="history-body">
          <h6>Paths</h6>
          {nodes.length === 0 ? (
            <div className="hint">No taxonomy paths exist yet.</div>
          ) : (
            <div className="req-paths">
              {nodes.map((n) => {
                const key = pathKey(n.path);
                return (
                  <label key={key} className="req-path">
                    <input type="checkbox" checked={picked.has(key)} onChange={() => toggle(key)} />
                    <span>{pathLabel(n.path)}</span>
                  </label>
                );
              })}
            </div>
          )}

          <h6 style={{ marginTop: 18 }}>Message (optional)</h6>
          <textarea
            className="f"
            rows={3}
            placeholder="Why do you need access? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="history-foot">
          <div className="review-btns">
            <button className="btn btn-primary sm" type="button" onClick={submit}>
              {pending ? "Update request" : "Send request"}
            </button>
            <button className="btn btn-secondary sm" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

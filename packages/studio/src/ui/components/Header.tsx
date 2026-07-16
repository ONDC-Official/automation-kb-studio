/**
 * Header — brand, manifest identity, the Author/Coverage view switch, and chrome. The "Manifest ▾"
 * panel edits the manifest identity `{ id, version }`, the source subject (a noun-phrase naming the
 * domain), and the taxonomy level LABELS (`levels`, PUT /api/meta), and holds the Export button
 * (regenerates the committed manifest.yaml). A theme toggle stamps `data-theme` on the root.
 */
import { useEffect, useState, type Dispatch } from "react";

import type { Action, View } from "../state";
import type { Manifest } from "../types";

function IdentityPanel({
  manifest,
  onSaveMeta,
  onExport,
}: {
  manifest: Manifest | null;
  onSaveMeta: (id: string, version: string, subject: string, levels: string[]) => void;
  onExport: () => void;
}): React.JSX.Element {
  const [id, setId] = useState(manifest?.id ?? "");
  const [version, setVersion] = useState(manifest?.version ?? "");
  const [subject, setSubject] = useState(manifest?.subject ?? "");
  const [levels, setLevels] = useState<string[]>(manifest?.levels ?? []);

  // Resync the form when the loaded manifest changes underneath us.
  useEffect(() => {
    setId(manifest?.id ?? "");
    setVersion(manifest?.version ?? "");
    setSubject(manifest?.subject ?? "");
    setLevels(manifest?.levels ?? []);
  }, [manifest]);

  return (
    <details className="identity-panel">
      <summary className="icon-btn">Manifest ▾</summary>
      <div className="identity-body">
        <label>id</label>
        <input className="f" value={id} onChange={(e) => setId(e.target.value)} />
        <label>version</label>
        <input className="f" value={version} onChange={(e) => setVersion(e.target.value)} />

        <label>subject</label>
        <input
          className="f"
          placeholder="a noun-phrase naming the domain (e.g. the ONDC protocol specifications)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <label>level labels</label>
        {levels.map((l, i) => (
          <div className="id-line" key={i}>
            <input
              className="f"
              placeholder={`level ${String(i + 1)}`}
              value={l}
              onChange={(e) => setLevels(levels.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <button className="mini" type="button" title="Remove level" onClick={() => setLevels(levels.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
        ))}
        <button className="btn ghost sm" type="button" onClick={() => setLevels([...levels, ""])}>
          ＋ Add level label
        </button>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button
            className="btn subtle sm"
            type="button"
            onClick={() => onSaveMeta(id.trim(), version.trim(), subject.trim(), levels.map((l) => l.trim()).filter(Boolean))}
          >
            Save identity
          </button>
          <button className="btn ghost sm" type="button" style={{ marginLeft: "auto" }} onClick={onExport}>
            Export .yaml
          </button>
        </div>
        <div className="hint" style={{ marginTop: 8 }}>
          Per-topic files are the source of truth. Export regenerates the committed manifest.yaml snapshot.
        </div>
      </div>
    </details>
  );
}

export function Header(props: {
  view: View;
  manifest: Manifest | null;
  theme: "light" | "dark" | null;
  dispatch: Dispatch<Action>;
  onSaveMeta: (id: string, version: string, subject: string, levels: string[]) => void;
  onExport: () => void;
}): React.JSX.Element {
  const { view, manifest, dispatch } = props;
  return (
    <header className="topbar">
      <div className="brand">KB STUDIO</div>
      <div className="manifest-id">{manifest ? `${manifest.id}@${manifest.version}` : "…"}</div>
      {manifest?.subject ? <div className="manifest-subject">{manifest.subject}</div> : null}
      <div className="spacer" />
      <div className="view-switch">
        {(["author", "coverage"] as const).map((v) => (
          <button
            key={v}
            type="button"
            className={`seg${view === v ? " active" : ""}`}
            onClick={() => dispatch({ type: "setView", view: v })}
          >
            {v}
          </button>
        ))}
      </div>
      <IdentityPanel manifest={manifest} onSaveMeta={props.onSaveMeta} onExport={props.onExport} />
      <button
        className="icon-btn"
        type="button"
        title="Toggle theme"
        onClick={() => dispatch({ type: "setTheme", theme: props.theme === "dark" ? "light" : "dark" })}
      >
        ◑
      </button>
    </header>
  );
}

/**
 * AdminView — the admin-only control panel (a third top-level view). Four stacked sections:
 *   1. Access & Permissions — edit the access policy (admins, per-user path scopes, defaults). Saving
 *      (PUT /api/access) writes the canonical `config.access` document, effective immediately.
 *   2. Users & Activity — the author workspaces + the open review queue.
 *   3. Deployment Status — mode, review/access configuration, and the signed-in identity.
 *   4. Manifest identity — the shared MetaForm (PUT /api/meta).
 * It is purely presentational: local edit state is seeded from props; every mutation is a callback.
 */
import { useEffect, useState } from "react";

import type { AccessPolicyView, AccessRequest, AdminOverview, Identity, Manifest, NodeInfo, Proposal } from "../types";
import { MetaForm } from "./MetaForm";

/** The policy payload the admin saves — the editable half of `AccessPolicyView`. */
export type AccessDraft = Omit<AccessPolicyView, "configured">;

const scopeLabel = (s: string[]): string => (s.length ? s.join(" / ") : "root · everything");
const scopeKey = (s: string[]): string => s.join(" ");

/** Chips for a scope list + a picker (node paths, plus "root · everything") to add one. */
function ScopeEditor({ scopes, nodes, onChange }: { scopes: string[][]; nodes: NodeInfo[]; onChange: (next: string[][]) => void }): React.JSX.Element {
  const have = new Set(scopes.map(scopeKey));
  const options = [[] as string[], ...nodes.map((n) => n.path)].filter((p) => !have.has(scopeKey(p)));
  return (
    <div className="q-chips" style={{ alignItems: "center" }}>
      {scopes.length === 0 && <span className="hint">no scopes — read-only</span>}
      {scopes.map((s) => (
        <span className="q-chip" key={scopeKey(s)}>
          <span className="q-chip-text">{scopeLabel(s)}</span>
          <button className="q-chip-x" type="button" title="Remove scope" onClick={() => onChange(scopes.filter((x) => scopeKey(x) !== scopeKey(s)))}>
            ✕
          </button>
        </span>
      ))}
      <select
        className="f"
        style={{ width: "auto", minHeight: 30, padding: "3px 8px" }}
        value=""
        onChange={(e) => {
          if (e.target.value === "") return;
          onChange([...scopes, JSON.parse(e.target.value) as string[]]);
        }}
      >
        <option value="">+ add scope…</option>
        {options.map((p) => (
          <option key={scopeKey(p)} value={JSON.stringify(p)}>
            {scopeLabel(p)}
          </option>
        ))}
      </select>
    </div>
  );
}

function AccessSection({ access, nodes, myEmail, onSave }: { access: AccessPolicyView | null; nodes: NodeInfo[]; myEmail: string; onSave: (draft: AccessDraft) => void }): React.JSX.Element {
  const [admins, setAdmins] = useState<string[]>([]);
  const [users, setUsers] = useState<{ email: string; scopes: string[][] }[]>([]);
  const [defaultScopes, setDefaultScopes] = useState<string[][]>([]);

  // Reseed the editor whenever the loaded policy changes underneath us.
  useEffect(() => {
    setAdmins(access?.admins ?? []);
    setUsers(access?.users ?? []);
    setDefaultScopes(access?.defaultScopes ?? []);
  }, [access]);

  if (!access) return <div className="hint">Loading…</div>;

  const save = (): void => {
    const cleanAdmins = admins.map((a) => a.trim()).filter(Boolean);
    const cleanUsers = users.map((u) => ({ email: u.email.trim(), scopes: u.scopes })).filter((u) => u.email);
    if (cleanAdmins.length === 0) {
      window.alert("At least one admin is required.");
      return;
    }
    if (!cleanAdmins.includes(myEmail) && !window.confirm(`You (${myEmail}) are not in the admins list — you'll lose admin access after saving. Continue?`)) return;
    onSave({ admins: cleanAdmins, users: cleanUsers, defaultScopes });
  };

  return (
    <>
      <h6>Admins</h6>
      <div className="hint" style={{ marginBottom: 8 }}>
        Full access: write any path, edit the manifest identity, and merge proposals.
      </div>
      {admins.map((a, i) => (
        <div className="id-line" key={i} style={{ marginBottom: 6 }}>
          <input className="f" placeholder="admin@example.com" value={a} onChange={(e) => setAdmins(admins.map((x, j) => (j === i ? e.target.value : x)))} />
          <button className="mini" type="button" title="Remove admin" onClick={() => setAdmins(admins.filter((_, j) => j !== i))}>
            ✕
          </button>
        </div>
      ))}
      <button className="btn ghost sm" type="button" onClick={() => setAdmins([...admins, ""])}>
        ＋ Add admin
      </button>

      <h6 style={{ marginTop: 22 }}>Users &amp; scopes</h6>
      <div className="hint" style={{ marginBottom: 8 }}>
        Each user may write only within their assigned path scopes. A user with no scopes is read-only.
      </div>
      {users.length === 0 && (
        <div className="hint" style={{ marginBottom: 8 }}>
          No scoped users yet.
        </div>
      )}
      {users.map((u, i) => (
        <div key={i} className="admin-user">
          <div className="id-line" style={{ marginBottom: 6 }}>
            <input className="f" placeholder="user@example.com" value={u.email} onChange={(e) => setUsers(users.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
            <button className="mini" type="button" title="Remove user" onClick={() => setUsers(users.filter((_, j) => j !== i))}>
              ✕
            </button>
          </div>
          <ScopeEditor scopes={u.scopes} nodes={nodes} onChange={(scopes) => setUsers(users.map((x, j) => (j === i ? { ...x, scopes } : x)))} />
        </div>
      ))}
      <button className="btn ghost sm" type="button" onClick={() => setUsers([...users, { email: "", scopes: [] }])}>
        ＋ Add user
      </button>

      <h6 style={{ marginTop: 22 }}>Default scopes</h6>
      <div className="hint" style={{ marginBottom: 8 }}>
        Applied to anyone signed in who isn’t an admin or a listed user. Leave empty for read-only (viewer) by default.
      </div>
      <ScopeEditor scopes={defaultScopes} nodes={nodes} onChange={setDefaultScopes} />

      <div style={{ display: "flex", gap: 8, marginTop: 20, alignItems: "center" }}>
        <button className="btn btn-primary sm" type="button" onClick={save}>
          Save access policy
        </button>
      </div>
      <div className="hint" style={{ marginTop: 8 }}>
        Saving writes the canonical access policy and takes effect immediately.
      </div>
    </>
  );
}

/** One pending access request: the requester, their note, an editable scope draft, and grant/deny. */
function RequestRow({ request, nodes, onGrant, onDeny }: { request: AccessRequest; nodes: NodeInfo[]; onGrant: (id: string, scopes: string[][]) => void; onDeny: (id: string) => void }): React.JSX.Element {
  const [scopes, setScopes] = useState<string[][]>(request.paths);
  return (
    <li className="history-row" style={{ flexWrap: "wrap" }}>
      <div className="history-main">
        <div className="history-msg">
          {request.name} &lt;{request.email}&gt;
        </div>
        <div className="history-meta">
          requested {request.createdAt.slice(0, 10)}
          {request.note ? ` · “${request.note}”` : ""}
        </div>
        <div style={{ marginTop: 6 }}>
          <ScopeEditor scopes={scopes} nodes={nodes} onChange={setScopes} />
        </div>
      </div>
      <div className="review-btns">
        <button className="btn btn-primary sm" type="button" disabled={scopes.length === 0} title={scopes.length === 0 ? "Add at least one scope to grant" : "Grant these scopes"} onClick={() => onGrant(request.id, scopes)}>
          Grant
        </button>
        <button className="btn btn-secondary sm" type="button" onClick={() => onDeny(request.id)}>
          Deny
        </button>
      </div>
    </li>
  );
}

function AccessRequestsSection({ requests, nodes, onGrant, onDeny }: { requests: AccessRequest[] | null; nodes: NodeInfo[]; onGrant: (id: string, scopes: string[][]) => void; onDeny: (id: string) => void }): React.JSX.Element {
  if (!requests) return <div className="hint">Loading…</div>;
  if (requests.length === 0) return <div className="hint">No pending access requests.</div>;
  return (
    <>
      <div className="hint" style={{ marginBottom: 8 }}>
        Granting adds the requester to the access policy with the scopes below (adjust before granting) — promoting them from viewer to author.
      </div>
      <ul className="history-list">
        {requests.map((r) => (
          <RequestRow key={r.id} request={r} nodes={nodes} onGrant={onGrant} onDeny={onDeny} />
        ))}
      </ul>
    </>
  );
}

export function AdminView({
  identity,
  access,
  overview,
  proposals,
  accessRequests,
  nodes,
  manifest,
  onSaveAccess,
  onGrantRequest,
  onDenyRequest,
  onSaveMeta,
  onExport,
  onImport,
}: {
  identity: Identity | null;
  access: AccessPolicyView | null;
  overview: AdminOverview | null;
  proposals: Proposal[] | null;
  accessRequests: AccessRequest[] | null;
  nodes: NodeInfo[];
  manifest: Manifest | null;
  onSaveAccess: (draft: AccessDraft) => void;
  onGrantRequest: (id: string, scopes: string[][]) => void;
  onDenyRequest: (id: string) => void;
  onSaveMeta: (id: string, version: string, subject: string, levels: string[]) => void;
  onExport: () => void;
  onImport: (yaml: string) => void;
}): React.JSX.Element {
  const myEmail = identity?.actor.email ?? "";
  return (
    <div className="admin">
      <section className="admin-section">
        <h3>Access &amp; Permissions</h3>
        <AccessSection access={access} nodes={nodes} myEmail={myEmail} onSave={onSaveAccess} />
      </section>

      <section className="admin-section">
        <h3>
          Access requests{accessRequests && accessRequests.length > 0 ? ` (${String(accessRequests.length)})` : ""}
        </h3>
        <AccessRequestsSection requests={accessRequests} nodes={nodes} onGrant={onGrantRequest} onDeny={onDenyRequest} />
      </section>

      <section className="admin-section">
        <h3>Users &amp; Activity</h3>
        <h6>Author workspaces</h6>
        {!overview ? (
          <div className="hint">Loading…</div>
        ) : overview.mode === "single" ? (
          <div className="hint">Single-user mode — no per-author workspaces.</div>
        ) : overview.workspaces.length === 0 ? (
          <div className="hint">No author workspaces yet.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Workspace</th>
                <th>Review</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {overview.workspaces.map((w) => (
                <tr key={w.workspace}>
                  <td>{w.ownerName ?? w.owner ?? "—"}</td>
                  <td>
                    <code className="c-id">{w.workspace}</code>
                  </td>
                  <td>{w.reviewStatus === "requested" ? "in review" : "—"}</td>
                  <td>{w.updatedAt ? w.updatedAt.slice(0, 10) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h6 style={{ marginTop: 22 }}>Open review queue</h6>
        {!proposals ? (
          <div className="hint">{overview?.reviewEnabled === false ? "Review flow not enabled on this deployment." : "Loading…"}</div>
        ) : proposals.length === 0 ? (
          <div className="hint">No open proposals.</div>
        ) : (
          <ul className="history-list">
            {proposals.map((p) => (
              <li key={p.id} className="history-row">
                <code className="history-sha">{p.workspace}</code>
                <div className="history-main">
                  <div className="history-msg">by {p.authorName}</div>
                  <div className="history-meta">
                    +{p.changes.added} ~{p.changes.edited} −{p.changes.deleted}
                    {p.changes.conflicted > 0 && <span className="s-alarm"> · {p.changes.conflicted} conflict(s)</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="admin-section">
        <h3>Deployment Status</h3>
        {!overview ? (
          <div className="hint">Loading…</div>
        ) : (
          <table className="table admin-status">
            <tbody>
              <tr>
                <th>Mode</th>
                <td>{overview.mode === "multi" ? "Multi-user (workspace-per-author)" : "Single-user"}</td>
              </tr>
              <tr>
                <th>Access control</th>
                <td>{overview.accessConfigured ? "Enforced (viewer by default)" : "Not configured"}</td>
              </tr>
              <tr>
                <th>Review flow</th>
                <td>{overview.reviewEnabled ? "Enabled" : "Not enabled"}</td>
              </tr>
              <tr>
                <th>Admins</th>
                <td>{overview.kbAdmins.length ? overview.kbAdmins.join(", ") : "—"}</td>
              </tr>
              <tr>
                <th>Signed in as</th>
                <td>
                  {identity ? (
                    <>
                      {identity.actor.name} &lt;{identity.actor.email}&gt; · {identity.role} · <code className="c-id">{identity.workspace}</code>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <h3>Manifest identity</h3>
        <MetaForm manifest={manifest} nodes={nodes} onSaveMeta={onSaveMeta} onExport={onExport} onImport={onImport} />
      </section>
    </div>
  );
}

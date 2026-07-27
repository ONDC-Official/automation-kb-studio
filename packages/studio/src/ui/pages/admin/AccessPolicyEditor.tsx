import { Plus, X } from "lucide-react";

import Button from "@/components/Button";
import Input from "@/components/Input";
import type { NodeInfo } from "@/services/types";

import ScopeEditor from "./ScopeEditor";
import type { AccessDraft } from "./utils";

interface IProps {
  draft: AccessDraft;
  configured: boolean;
  nodes: NodeInfo[];
  saving: boolean;
  onChange: (next: AccessDraft) => void;
  onSave: () => void;
}

const sectionTitle = "text-sm font-semibold text-foreground";
const hint = "text-xs text-neutral-600";

/** The editable access policy: admins, per-user path scopes, and default scopes. Draft lives in the page hook. */
const AccessPolicyEditor = ({ draft, configured, nodes, saving, onChange, onSave }: IProps) => (
  <div className="flex flex-col gap-5">
    {!configured && (
      <div className="rounded-md border border-warn/40 bg-warn/10 p-2.5 text-xs text-warn">
        Open mode — no access policy configured yet. Everyone signed in has full write access. Saving below
        switches the deployment to enforced (viewer-by-default) access.
      </div>
    )}

    <section className="flex flex-col gap-2">
      <div className={sectionTitle}>Admins</div>
      <div className={hint}>Full access: write any path, edit the manifest identity, and merge proposals.</div>
      {draft.admins.map((a, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder="admin@example.com"
            value={a}
            onChange={(e) => onChange({ ...draft, admins: draft.admins.map((x, j) => (j === i ? e.target.value : x)) })}
          />
          <Button
            variant="ghost"
            size="icon"
            title="Remove admin"
            onClick={() => onChange({ ...draft, admins: draft.admins.filter((_, j) => j !== i) })}
          >
            <X />
          </Button>
        </div>
      ))}
      <div>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...draft, admins: [...draft.admins, ""] })}>
          <Plus /> Add admin
        </Button>
      </div>
    </section>

    <section className="flex flex-col gap-2">
      <div className={sectionTitle}>Users &amp; scopes</div>
      <div className={hint}>
        Each user may write only within their assigned path scopes. A user with no scopes is read-only.
      </div>
      {draft.users.length === 0 && <div className={hint}>No scoped users yet.</div>}
      {draft.users.map((u, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-md border border-border p-2.5">
          <div className="flex items-center gap-2">
            <Input
              placeholder="user@example.com"
              value={u.email}
              onChange={(e) =>
                onChange({ ...draft, users: draft.users.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)) })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              title="Remove user"
              onClick={() => onChange({ ...draft, users: draft.users.filter((_, j) => j !== i) })}
            >
              <X />
            </Button>
          </div>
          <ScopeEditor
            scopes={u.scopes}
            nodes={nodes}
            onChange={(scopes) => onChange({ ...draft, users: draft.users.map((x, j) => (j === i ? { ...x, scopes } : x)) })}
          />
        </div>
      ))}
      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...draft, users: [...draft.users, { email: "", scopes: [] }] })}
        >
          <Plus /> Add user
        </Button>
      </div>
    </section>

    <section className="flex flex-col gap-2">
      <div className={sectionTitle}>Default scopes</div>
      <div className={hint}>
        Applied to anyone signed in who isn&apos;t an admin or a listed user. Leave empty for read-only (viewer) by default.
      </div>
      <ScopeEditor scopes={draft.defaultScopes} nodes={nodes} onChange={(defaultScopes) => onChange({ ...draft, defaultScopes })} />
    </section>

    <div className="flex flex-col gap-1">
      <div>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save access policy"}
        </Button>
      </div>
      <div className={hint}>Saving writes the canonical access policy and takes effect immediately.</div>
    </div>
  </div>
);

export default AccessPolicyEditor;

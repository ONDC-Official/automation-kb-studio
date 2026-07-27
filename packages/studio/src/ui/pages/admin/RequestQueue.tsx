import { useState } from "react";

import Button from "@/components/Button";
import type { AccessRequest, NodeInfo } from "@/services/types";

import ScopeEditor from "./ScopeEditor";

interface IRowProps {
  request: AccessRequest;
  nodes: NodeInfo[];
  pending: boolean;
  onGrant: (id: string, scopes: string[][]) => void;
  onDeny: (id: string) => void;
}

/** One pending request: requester + note + an editable scope draft the admin adjusts before granting. */
const RequestRow = ({ request, nodes, pending, onGrant, onDeny }: IRowProps) => {
  const [scopes, setScopes] = useState<string[][]>(request.paths);
  return (
    <li className="flex flex-col gap-2 rounded-md border border-border p-2.5">
      <div>
        <div className="text-sm text-foreground">
          {request.name} &lt;{request.email}&gt;
        </div>
        <div className="text-xs text-neutral-600">
          requested {request.createdAt.slice(0, 10)}
          {request.note ? ` · “${request.note}”` : ""}
        </div>
      </div>
      <ScopeEditor scopes={scopes} nodes={nodes} onChange={setScopes} />
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={scopes.length === 0 || pending}
          title={scopes.length === 0 ? "Add at least one scope to grant" : "Grant these scopes"}
          onClick={() => onGrant(request.id, scopes)}
        >
          Grant
        </Button>
        <Button variant="outline" size="sm" disabled={pending} onClick={() => onDeny(request.id)}>
          Deny
        </Button>
      </div>
    </li>
  );
};

interface IProps {
  requests: AccessRequest[] | undefined;
  loading: boolean;
  nodes: NodeInfo[];
  pending: boolean;
  onGrant: (id: string, scopes: string[][]) => void;
  onDeny: (id: string) => void;
}

const RequestQueue = ({ requests, loading, nodes, pending, onGrant, onDeny }: IProps) => {
  if (loading || !requests) return <div className="text-xs text-neutral-600">Loading…</div>;
  if (requests.length === 0) return <div className="text-xs text-neutral-600">No pending access requests.</div>;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-neutral-600">
        Granting adds the requester to the access policy with the scopes below (adjust before granting) — promoting
        them from viewer to author.
      </div>
      <ul className="flex flex-col gap-2">
        {requests.map((r) => (
          <RequestRow key={r.id} request={r} nodes={nodes} pending={pending} onGrant={onGrant} onDeny={onDeny} />
        ))}
      </ul>
    </div>
  );
};

export default RequestQueue;

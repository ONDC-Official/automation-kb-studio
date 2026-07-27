import Badge from "@/components/Badge";
import type { AdminOverview, Identity } from "@/services/types";

interface IProps {
  overview: AdminOverview;
  identity: Identity | undefined;
}

const th = "px-2 py-1.5 text-left font-medium text-neutral-600";
const td = "px-2 py-1.5 align-top";

/** Author workspaces + a compact deployment-status summary. */
const OverviewTable = ({ overview, identity }: IProps) => (
  <div className="flex flex-col gap-5">
    <section className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-foreground">Author workspaces</div>
      {overview.mode === "single" ? (
        <div className="text-xs text-neutral-600">Single-user mode — no per-author workspaces.</div>
      ) : overview.workspaces.length === 0 ? (
        <div className="text-xs text-neutral-600">No author workspaces yet.</div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className={th}>User</th>
                <th className={th}>Workspace</th>
                <th className={th}>Review</th>
                <th className={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {overview.workspaces.map((w) => (
                <tr key={w.workspace} className="border-b border-border">
                  <td className={td}>{w.ownerName ?? w.owner ?? "—"}</td>
                  <td className={td}>
                    <code className="text-xs text-neutral-600">{w.workspace}</code>
                  </td>
                  <td className={td}>
                    {w.reviewStatus === "requested" ? <Badge tone="caution">in review</Badge> : "—"}
                  </td>
                  <td className={td}>{w.updatedAt ? w.updatedAt.slice(0, 10) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    <section className="flex flex-col gap-2">
      <div className="text-sm font-semibold text-foreground">Deployment status</div>
      <table className="text-sm">
        <tbody>
          <tr>
            <th className={th}>Mode</th>
            <td className={td}>{overview.mode === "multi" ? "Multi-user (workspace-per-author)" : "Single-user"}</td>
          </tr>
          <tr>
            <th className={th}>Access control</th>
            <td className={td}>{overview.accessConfigured ? "Enforced (viewer by default)" : "Not configured"}</td>
          </tr>
          <tr>
            <th className={th}>Review flow</th>
            <td className={td}>{overview.reviewEnabled ? "Enabled" : "Not enabled"}</td>
          </tr>
          <tr>
            <th className={th}>Admins</th>
            <td className={td}>{overview.kbAdmins.length ? overview.kbAdmins.join(", ") : "—"}</td>
          </tr>
          <tr>
            <th className={th}>Signed in as</th>
            <td className={td}>
              {identity ? (
                <>
                  {identity.actor.name} &lt;{identity.actor.email}&gt; · {identity.role} ·{" "}
                  <code className="text-xs text-neutral-600">{identity.workspace}</code>
                </>
              ) : (
                "—"
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
);

export default OverviewTable;

import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import PageHeader from "@/components/PageHeader";
import { useIdentity } from "@/hooks/useIdentity";

import AccessPolicyEditor from "./AccessPolicyEditor";
import OverviewTable from "./OverviewTable";
import RequestQueue from "./RequestQueue";
import ReviewQueue from "./ReviewQueue";
import { useAdminPage } from "./useAdminPage";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
    <h2 className="text-base font-semibold text-foreground">{title}</h2>
    {children}
  </section>
);

const Admin = () => {
  const { data: identity } = useIdentity();
  const page = useAdminPage();

  // Self-gate: a non-admin who hand-types #/admin is bounced back to Author.
  if (identity && identity.role !== "admin") return <Navigate to="/" replace />;

  const requestCount = page.requests?.length ?? 0;

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4">
      <PageHeader title="Admin" description="Access policy, users, and the review queue" />

      <div className="flex flex-col gap-4 overflow-auto">
        <Section title="Access & Permissions">
          {page.policy && page.draft ? (
            <AccessPolicyEditor
              draft={page.draft}
              configured={page.policy.configured}
              nodes={page.nodes}
              saving={page.saving}
              onChange={page.setDraft}
              onSave={page.onSaveAccess}
            />
          ) : (
            <div className="text-xs text-neutral-600">Loading…</div>
          )}
        </Section>

        <Section title={requestCount > 0 ? `Access requests (${String(requestCount)})` : "Access requests"}>
          <RequestQueue
            requests={page.requests}
            loading={page.requestsLoading}
            nodes={page.nodes}
            pending={page.grantOrDenyPending}
            onGrant={page.onGrant}
            onDeny={page.onDeny}
          />
        </Section>

        <Section title="Users & Activity">
          {page.overview ? (
            <OverviewTable overview={page.overview} identity={page.identity} />
          ) : (
            <div className="text-xs text-neutral-600">Loading…</div>
          )}
        </Section>

        <Section title="Review queue">
          <ReviewQueue
            proposals={page.proposals}
            loading={page.proposalsLoading}
            reviewEnabled={page.overview?.reviewEnabled ?? true}
            expandedId={page.expandedId}
            detail={page.detail}
            detailLoading={page.detailLoading}
            merging={page.merging}
            onToggle={page.onToggleProposal}
            onMerge={page.onMerge}
          />
        </Section>
      </div>
    </div>
  );
};

export default Admin;

import { GitPullRequest, History, KeyRound, Settings2 } from "lucide-react";

import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import type { Filters } from "@/lib/derive";
import HistoryDialog from "./HistoryDialog";
import MetaDialog from "./MetaDialog";
import PathTree from "./PathTree";
import RequestAccessDialog from "./RequestAccessDialog";
import ReviewDialog from "./ReviewDialog";
import Toolbar from "./Toolbar";
import TopicList from "./TopicList";
import { useAuthorPage } from "./useAuthorPage";

const Author = () => {
  const page = useAuthorPage();
  const { identity, manifest } = page;
  const isViewer = identity?.role === "viewer";
  const filters: Filters = { query: page.query, kind: page.kindFilter, status: page.statusFilter };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <PageHeader
          title={manifest?.id ?? "Author"}
          description={manifest?.subject ?? "Edit the knowledge-base manifest"}
          actions={
            <>
              <Button variant="ghost" size="sm" onClick={() => page.setDialog("meta")}>
                <Settings2 /> Manifest
              </Button>
              <Button variant="ghost" size="sm" onClick={() => page.setDialog("history")}>
                <History /> History
              </Button>
              {isViewer ? (
                <Button variant="outline" size="sm" onClick={() => page.setDialog("requestAccess")}>
                  <KeyRound /> {identity?.accessRequest ? "Access requested" : "Request access"}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => page.setDialog("review")}>
                  <GitPullRequest /> Review
                </Button>
              )}
            </>
          }
        />
      </div>

      <div className="flex min-h-0 flex-1">
        <PathTree
          nodes={page.nodes}
          manifest={manifest}
          index={page.index}
          hasCoverage={page.hasCoverage}
          selectedPath={page.selectedPath}
          selectPath={page.selectPath}
          collapsed={page.collapsed}
          toggleCollapse={page.toggleCollapse}
          scopes={page.scopes}
          onCreateNode={page.createNode}
          onRenameNode={page.renameNode}
          onDeleteNode={page.deleteNode}
        />
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-4">
          <Toolbar
            query={page.query}
            setQuery={page.setQuery}
            kindFilter={page.kindFilter}
            toggleKind={page.toggleKind}
            statusFilter={page.statusFilter}
            toggleStatus={page.toggleStatus}
            hasCoverage={page.hasCoverage}
            onNewTopic={page.onNewTopic}
          />
          <TopicList
            manifest={manifest}
            manifestError={page.manifestError}
            index={page.index}
            hasCoverage={page.hasCoverage}
            selectedPath={page.selectedPath}
            filters={filters}
            scopes={page.scopes}
            editorsApi={page.editors}
            onOpenTopic={page.onOpenTopic}
          />
        </div>
      </div>

      <MetaDialog
        open={page.dialog === "meta"}
        onOpenChange={(o) => page.setDialog(o ? "meta" : null)}
        manifest={manifest}
        nodes={page.nodes}
        onSaveMeta={page.saveMeta}
        onExport={page.exportManifest}
        onImport={page.importManifest}
      />
      <HistoryDialog open={page.dialog === "history"} onOpenChange={(o) => page.setDialog(o ? "history" : null)} onRestore={page.restoreTopic} />
      <ReviewDialog
        open={page.dialog === "review"}
        onOpenChange={(o) => page.setDialog(o ? "review" : null)}
        identity={identity}
        syncConflicts={page.syncConflicts}
        dismissSyncConflicts={page.dismissSyncConflicts}
        onSubmit={page.submitForReview}
        onWithdraw={page.withdrawProposal}
        onSync={page.syncWithMain}
        onResolve={page.resolveSyncConflict}
      />
      <RequestAccessDialog
        open={page.dialog === "requestAccess"}
        onOpenChange={(o) => page.setDialog(o ? "requestAccess" : null)}
        nodes={page.nodes}
        initialPaths={page.selectedPath.length ? [page.selectedPath] : []}
        pending={identity?.accessRequest ?? null}
        onSubmit={page.submitAccessRequest}
      />
    </div>
  );
};

export default Author;

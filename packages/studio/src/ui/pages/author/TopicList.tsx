import Meter from "@/components/Meter";
import HealthTags from "@/components/HealthTags";
import {
  emptyHealth,
  groupByPath,
  healthOf,
  inScope,
  pathKey,
  topicKey,
  visibleTopics,
  type Filters,
  type StatusIndex,
} from "@/lib/derive";
import type { Manifest } from "@/services/types";
import TopicCard from "./TopicCard";
import TopicEditor from "./TopicEditor";
import type { EditorState } from "./editors";
import type { EditorsApi } from "./useEditors";

interface IProps {
  manifest: Manifest | null;
  manifestError: string | null;
  index: StatusIndex;
  hasCoverage: boolean;
  selectedPath: string[];
  filters: Filters;
  scopes: string[][];
  editorsApi: EditorsApi;
  onOpenTopic: (topic: Manifest["topics"][number]) => void;
}

const TopicList = ({ manifest, manifestError, index, hasCoverage, selectedPath, filters, scopes, editorsApi, onOpenTopic }: IProps) => {
  const topics = manifest?.topics ?? [];
  const visible = visibleTopics(topics, selectedPath, filters, index);
  const groups = groupByPath(visible);

  const editorsByKey = new Map<string, EditorState>();
  const draftsByPath = new Map<string, EditorState[]>();
  for (const ed of editorsApi.editors) {
    if (ed.original) {
      editorsByKey.set(topicKey(ed.original), ed);
    } else {
      const arr = draftsByPath.get(pathKey(ed.path)) ?? [];
      arr.push(ed);
      draftsByPath.set(pathKey(ed.path), arr);
    }
  }
  const groupKeys = new Set(groups.map((g) => pathKey(g.path)));
  const orphanDraftGroups = [...draftsByPath.entries()].filter(([k]) => !groupKeys.has(k));

  const renderEditor = (ed: EditorState) => (
    <TopicEditor
      key={ed.eid}
      editor={ed}
      index={index}
      hasCoverage={hasCoverage}
      canDelete={inScope(ed.path, scopes)}
      api={editorsApi}
    />
  );

  if (manifestError) {
    return (
      <div className="grid flex-1 place-items-center p-8 text-center">
        <div>
          <div className="text-base font-semibold">Manifest invalid</div>
          <pre className="mt-2 max-w-lg whitespace-pre-wrap text-sm text-error">{manifestError}</pre>
          {editorsApi.editors.length === 0 && (
            <div className="mt-2 text-sm text-neutral-500">Press “＋ New topic” to add one back — that doesn’t need a valid manifest.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {orphanDraftGroups.map(([k, ds]) => (
        <div key={`__draft_${k}`} className="flex flex-col gap-2">
          <div className="text-xs font-medium text-neutral-500">{ds[0]?.path.join(" / ") || "(no path)"} · new topic</div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(21rem,1fr))] items-start gap-3">{ds.map(renderEditor)}</div>
        </div>
      ))}

      {groups.length === 0 && orphanDraftGroups.length === 0 ? (
        <div className="grid flex-1 place-items-center p-8 text-center text-sm text-neutral-500">
          <div>
            <div className="text-base font-semibold text-foreground">{topics.length ? "No matches" : "No topics yet"}</div>
            {topics.length ? "Nothing matches the current search or filters." : "Press “＋ New topic” to author the first one."}
          </div>
        </div>
      ) : (
        groups.map((g) => {
          const under = topics.filter((t) => pathKey(t.path) === pathKey(g.path));
          const health = hasCoverage ? healthOf(under, index) : emptyHealth();
          const groupDrafts = draftsByPath.get(pathKey(g.path)) ?? [];
          return (
            <div key={pathKey(g.path)} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 border-b border-border pb-1">
                <span className="text-sm font-medium">{g.path.join(" / ")}</span>
                <span className="text-xs text-neutral-500">
                  {g.topics.length}
                  {g.topics.length !== under.length ? `/${String(under.length)}` : ""}
                </span>
                {hasCoverage && (
                  <span className="ml-auto flex items-center gap-2">
                    <HealthTags counts={health} hasCoverage />
                    <Meter counts={health} width="110px" />
                  </span>
                )}
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(21rem,1fr))] items-start gap-3">
                {groupDrafts.map(renderEditor)}
                {g.topics.map((t) => {
                  const ed = editorsByKey.get(topicKey(t));
                  return ed ? renderEditor(ed) : <TopicCard key={t.id} t={t} index={index} hasCoverage={hasCoverage} onOpen={() => onOpenTopic(t)} />;
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TopicList;

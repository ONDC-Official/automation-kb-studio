import Badge from "@/components/Badge";
import type { Change, ChangeSnapshot } from "@/services/types";

const CLASS_LABEL: Record<Change["class"], string> = { add: "added", edit: "edited", delete: "deleted", conflict: "conflict" };
const CLASS_TONE: Record<Change["class"], "ok" | "caution" | "muted" | "alarm"> = {
  add: "ok",
  edit: "caution",
  delete: "muted",
  conflict: "alarm",
};

/** Split the author's questions against main's into removed / added / kept (order-preserving). */
function diffQuestions(before: string[], after: string[]): { removed: string[]; added: string[]; kept: string[] } {
  const b = new Set(before);
  const a = new Set(after);
  return { removed: before.filter((q) => !a.has(q)), added: after.filter((q) => !b.has(q)), kept: after.filter((q) => b.has(q)) };
}

const signCls = (sign: "+" | "-" | " "): string =>
  sign === "+" ? "text-ok" : sign === "-" ? "text-error" : "text-neutral-500";

function QLine({ sign, text }: { sign: "+" | "-" | " "; text: string }) {
  return (
    <div className={`flex gap-1.5 text-xs ${signCls(sign)}`}>
      <span className="select-none">{sign}</span>
      <span>{text}</span>
    </div>
  );
}

/** A field-level line: shows old → new when they differ, or nothing when equal. */
function FieldDiff({ label, before, after }: { label: string; before: string | undefined; after: string | undefined }) {
  if (before === after) return null;
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className="text-neutral-500">{label}</span>
      {before !== undefined && <span className="text-error line-through">{before}</span>}
      {before !== undefined && after !== undefined && <span className="text-neutral-500">→</span>}
      {after !== undefined && <span className="text-ok">{after}</span>}
    </div>
  );
}

/** Full content of an added or deleted topic (every question is new / gone). */
function TopicBody({ snap, sign, note }: { snap: ChangeSnapshot; sign: "+" | "-"; note: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-neutral-500">
        {note} · kind <strong className="text-foreground">{snap.kind}</strong>
      </div>
      {snap.questions.map((t, i) => (
        <QLine key={i} sign={sign} text={t} />
      ))}
    </div>
  );
}

/** The before/after content of one change — what a reviewer needs to decide the merge. */
function ChangeDetail({ c }: { c: Change }) {
  const mine = c.mine; // the author's proposed version (null = they deleted it)
  const theirs = c.theirs; // main's current version (null = new topic)

  if (c.class === "add" && mine) return <TopicBody snap={mine} sign="+" note="new topic" />;
  if (c.class === "delete" && theirs) return <TopicBody snap={theirs} sign="-" note="removed" />;

  const q = diffQuestions(theirs?.questions ?? [], mine?.questions ?? []);
  return (
    <div className="flex flex-col gap-1">
      {c.class === "conflict" && (
        <div className="text-xs text-error">
          Conflicts with main ({c.conflictKind}) — the author must sync &amp; resolve before this can merge.
        </div>
      )}
      <FieldDiff label="title" before={theirs?.title} after={mine?.title} />
      <FieldDiff label="kind" before={theirs?.kind} after={mine?.kind} />
      {q.removed.length + q.added.length === 0 ? (
        <div className="text-xs text-neutral-500">questions unchanged</div>
      ) : (
        <div className="flex flex-col gap-1">
          {q.removed.map((t, i) => (
            <QLine key={`r${String(i)}`} sign="-" text={t} />
          ))}
          {q.added.map((t, i) => (
            <QLine key={`a${String(i)}`} sign="+" text={t} />
          ))}
          {q.kept.length > 0 && <div className="text-xs text-neutral-500">{q.kept.length} question(s) unchanged</div>}
        </div>
      )}
    </div>
  );
}

/** The full live diff for one proposal — a list of topic-level changes. */
const ProposalDiff = ({ changes }: { changes: Change[] }) => {
  if (changes.length === 0) return <div className="text-xs text-neutral-600">No changes.</div>;
  return (
    <ul className="flex flex-col gap-2">
      {changes.map((c) => (
        <li key={c.key} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
          <div className="flex items-center gap-2">
            <Badge tone={CLASS_TONE[c.class]}>{c.conflictKind ?? CLASS_LABEL[c.class]}</Badge>
            <span className="text-sm text-foreground">{c.title}</span>
            <code className="text-xs text-neutral-500">{c.key}</code>
          </div>
          <ChangeDetail c={c} />
        </li>
      ))}
    </ul>
  );
};

export default ProposalDiff;

import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import { useHistory } from "@/hooks/useHistory";
import type { DeletedEntry } from "@/services/types";

interface IProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onRestore: (entry: DeletedEntry) => void;
}

/** History / Trash: recent commits + recoverable deletions (one-click restore). */
const HistoryDialog = ({ open, onOpenChange, onRestore }: IProps) => {
  const { data, isLoading } = useHistory(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="History & Trash" description="Recent changes and one-click restore of deleted topics.">
      {isLoading ? (
        <div className="text-sm text-neutral-500">Loading…</div>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Deleted topics</h3>
            {data && data.deletions.length > 0 ? (
              data.deletions.map((d) => (
                <div key={`${d.file}-${d.restoreSha}`} className="flex items-center gap-2 rounded-md border border-border p-2 text-sm">
                  <div className="min-w-0">
                    <div className="truncate font-mono text-xs">{d.file}</div>
                    <div className="text-xs text-neutral-500">
                      deleted by {d.deletedBy} · {d.deletedAt}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto" onClick={() => onRestore(d)}>
                    Restore
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-500">Nothing in the trash.</div>
            )}
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Recent commits</h3>
            {data && data.commits.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {data.commits.map((c) => (
                  <li key={c.sha} className="flex items-baseline gap-2 text-sm">
                    <span className="font-mono text-xs text-neutral-500">{c.sha.slice(0, 7)}</span>
                    <span className="truncate">{c.message}</span>
                    <span className="ml-auto shrink-0 text-xs text-neutral-500">{c.author}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-neutral-500">No history.</div>
            )}
          </section>
        </div>
      )}
    </Dialog>
  );
};

export default HistoryDialog;

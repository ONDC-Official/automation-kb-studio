/** A single transient toast pinned to the bottom-center. Auto-dismiss is owned by App (a timer). */
import type { Toast as ToastModel } from "../state";

export function Toast({ toast }: { toast: ToastModel | null }): React.JSX.Element | null {
  if (!toast) return null;
  return <div className={`toast show${toast.kind === "error" ? " err" : ""}`}>{toast.message}</div>;
}

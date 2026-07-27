import Badge from "@/components/Badge";
import { bucketOf } from "@/lib/derive";
import type { TopicStatus } from "@/services/types";

const BUCKET_TONE = {
  ok: "ok",
  caution: "caution",
  gap: "muted",
  alarm: "alarm",
} as const;

/** The status pill for a topic result — tone follows the fixed ok/caution/alarm palette via its bucket. */
const StatusBadge = ({ status }: { status: TopicStatus }) => (
  <Badge tone={BUCKET_TONE[bucketOf(status)]}>{status}</Badge>
);

export default StatusBadge;

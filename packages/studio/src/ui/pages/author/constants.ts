import type { StatusBucket } from "@/lib/derive";
import type { Kind } from "@/services/types";

export const KIND_CHIPS: { kind: Kind; label: string }[] = [
  { kind: "real", label: "real" },
  { kind: "canary", label: "canary" },
];

export const STATUS_CHIPS: { bucket: StatusBucket; label: string }[] = [
  { bucket: "ok", label: "grounded" },
  { bucket: "gap", label: "gap" },
  { bucket: "caution", label: "caution" },
  { bucket: "alarm", label: "alarm" },
];

/** Drag-to-resize bounds for the taxonomy explorer rail (px). Width persists in localStorage. */
export const RAIL_MIN = 180;
export const RAIL_MAX = 560;
export const RAIL_DEFAULT = 256;
export const RAIL_KEY = "kb.railWidth";

/** Join taxonomy path segments (and an optional trailing id) into an API ref, each URL-encoded. */
export function encodeRef(...segments: string[]): string {
  return segments.map(encodeURIComponent).join("/");
}

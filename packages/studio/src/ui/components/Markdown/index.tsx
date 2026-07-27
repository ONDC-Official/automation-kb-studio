// ponytail: minimal markdown — headings, bold/italic/code, links, lists, blockquote, fenced code.
// No tables/nested lists; swap in marked+DOMPurify if answers start needing them. No raw HTML, so
// there is no injection surface even when the source answer is untrusted.
//
// Inner elements are deliberately classless (h4/ul/li/pre/…); all styling is descendant-scoped on the
// wrapper via Tailwind arbitrary variants, which keeps the emitted markup stable for markdown.test.tsx.
function inlineMd(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0] ?? "";
    const key = `${keyBase}-${String(k++)}`;
    if (tok.startsWith("`")) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[")) {
      const link = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      const href = link?.[2] ?? "";
      // Only follow safe schemes; anything else renders as plain text (no javascript: URLs).
      if (link && /^(https?:|\/|#|mailto:)/i.test(href))
        out.push(
          <a key={key} href={href} target="_blank" rel="noreferrer noopener">
            {link[1] ?? ""}
          </a>,
        );
      else out.push(tok);
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const WRAPPER =
  "flex flex-col gap-2 text-sm leading-relaxed [&_a]:text-accent-700 [&_a]:underline " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-neutral-600 [&_blockquote]:italic " +
  "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1 [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold " +
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-neutral-200 [&_pre]:p-2 [&_pre]:text-xs";

const Markdown = ({ text }: { text: string }) => {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  const isBlockStart = (l: string): boolean => /^(```|#{1,6}\s|>\s?|\s*[-*+]\s+|\s*\d+\.\s+)/.test(l);
  const at = (n: number): string => lines[n] ?? "";
  while (i < lines.length) {
    const line = at(i);
    const key = `b${String(blocks.length)}`;
    if (/^```/.test(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(at(i))) buf.push(at(i++));
      i++; // closing fence
      blocks.push(
        <pre key={key}>
          <code>{buf.join("\n")}</code>
        </pre>,
      );
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min((h[1] ?? "").length + 2, 6);
      const Tag = `h${String(level)}` as "h3" | "h4" | "h5" | "h6";
      blocks.push(<Tag key={key}>{inlineMd(h[2] ?? "", key)}</Tag>);
      i++;
      continue;
    }
    if (/^>\s?/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^>\s?/.test(at(i))) buf.push(at(i++).replace(/^>\s?/, ""));
      blocks.push(<blockquote key={key}>{inlineMd(buf.join(" "), key)}</blockquote>);
      continue;
    }
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(at(i)))
        items.push(<li key={items.length}>{inlineMd(at(i++).replace(/^\s*[-*+]\s+/, ""), `${key}-${String(items.length)}`)}</li>);
      blocks.push(<ul key={key}>{items}</ul>);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(at(i)))
        items.push(<li key={items.length}>{inlineMd(at(i++).replace(/^\s*\d+\.\s+/, ""), `${key}-${String(items.length)}`)}</li>);
      blocks.push(<ol key={key}>{items}</ol>);
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && at(i).trim() && !isBlockStart(at(i))) buf.push(at(i++));
    blocks.push(<p key={key}>{inlineMd(buf.join(" "), key)}</p>);
  }
  return <div className={WRAPPER}>{blocks}</div>;
};

export default Markdown;

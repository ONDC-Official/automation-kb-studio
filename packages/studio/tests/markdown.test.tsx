import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Markdown } from "../src/ui/components/common";

const html = (text: string): string => renderToStaticMarkup(<Markdown text={text} />);

describe("Markdown", () => {
  it("renders headings, emphasis, code and links", () => {
    const out = html("## Title\n\nA **bold** and *italic* word with `code` and a [link](https://x.io).");
    expect(out).toContain("<h4>Title</h4>");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
    expect(out).toContain("<code>code</code>");
    expect(out).toContain('href="https://x.io"');
  });

  it("renders bullet and ordered lists and fenced code", () => {
    expect(html("- one\n- two")).toContain("<ul><li>one</li><li>two</li></ul>");
    expect(html("1. a\n2. b")).toContain("<ol><li>a</li><li>b</li></ol>");
    expect(html("```\nx = 1\n```")).toContain("<pre><code>x = 1</code></pre>");
  });

  it("never emits a javascript: link (renders it as text)", () => {
    const out = html("[click](javascript:alert(1))");
    expect(out).not.toContain("<a ");
    expect(out).not.toContain("href=");
    expect(out).toContain("[click](javascript:alert(1))");
  });
});

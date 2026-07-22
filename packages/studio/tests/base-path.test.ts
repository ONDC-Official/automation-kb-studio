import { describe, expect, it } from "vitest";

import { normalizeBasePath, stripBase } from "../src/server";

/**
 * Sub-path hosting (e.g. https://host/kb-studio/). `normalizeBasePath` reads KB_BASE_PATH into a canonical
 * form; `stripBase` folds an incoming pathname back to root-relative so routing matches whether the outer
 * proxy preserves the prefix (path arrives as /kb-studio/api/…) or rewrites it away (arrives as /api/…).
 */
describe("base-path mounting", () => {
  it("normalizes assorted KB_BASE_PATH spellings to a leading-slash, no-trailing form", () => {
    expect(normalizeBasePath("/kb-studio")).toBe("/kb-studio");
    expect(normalizeBasePath("kb-studio")).toBe("/kb-studio");
    expect(normalizeBasePath("/kb-studio/")).toBe("/kb-studio");
    expect(normalizeBasePath("  /kb-studio/  ")).toBe("/kb-studio");
    // Root or empty means "no prefix".
    expect(normalizeBasePath("/")).toBe("");
    expect(normalizeBasePath("")).toBe("");
    expect(normalizeBasePath(undefined)).toBe("");
  });

  it("strips the prefix when the proxy preserves it", () => {
    const base = "/kb-studio";
    expect(stripBase("/kb-studio", base)).toBe("/"); // no trailing slash → home
    expect(stripBase("/kb-studio/", base)).toBe("/");
    expect(stripBase("/kb-studio/api/nodes", base)).toBe("/api/nodes");
    expect(stripBase("/kb-studio/assets/index.js", base)).toBe("/assets/index.js");
  });

  it("is a no-op when the proxy already rewrote the prefix away", () => {
    const base = "/kb-studio";
    expect(stripBase("/", base)).toBe("/");
    expect(stripBase("/api/nodes", base)).toBe("/api/nodes");
    expect(stripBase("/assets/index.js", base)).toBe("/assets/index.js");
  });

  it("does not strip a mere prefix-substring path", () => {
    const base = "/kb-studio";
    // "/kb-studiox" shares the prefix but is a different mount — must be left untouched.
    expect(stripBase("/kb-studiox/api", base)).toBe("/kb-studiox/api");
  });

  it("root mount (base '') passes every path through unchanged", () => {
    expect(stripBase("/", "")).toBe("/");
    expect(stripBase("/api/nodes", "")).toBe("/api/nodes");
    expect(stripBase("/kb-studio/api", "")).toBe("/kb-studio/api");
  });
});

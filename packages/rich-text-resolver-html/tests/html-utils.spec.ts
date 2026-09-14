import { describe, expect, it } from "vitest";
import { escapeHtml } from "@kontent-ai/rich-text-resolver";
import { escapeHtmlAttribute, formatAttributes } from "../src/html-utils.js";

describe("escapeHtmlAttribute", () => {
  it("is a deprecated alias of escapeHtml from the core package", () => {
    expect(escapeHtmlAttribute).toBe(escapeHtml);
  });
});

describe("formatAttributes", () => {
  it("separates attributes with a single space and escapes values", () => {
    expect(formatAttributes({ title: 'he said "hi"', lang: "en" })).toBe(
      `title="he said &quot;hi&quot;" lang="en"`,
    );
  });

  it("returns an empty string when there are no attributes", () => {
    expect(formatAttributes({})).toBe("");
  });

  it("omits values that are not strings", () => {
    expect(
      formatAttributes({
        href: "https://example.com",
        a: undefined,
        b: null,
        c: { x: 1 },
        d: ["a", "b"],
        e: 42,
      }),
    ).toBe(`href="https://example.com"`);
  });

  it("omits an object even when it defines a hostile toString", () => {
    expect(formatAttributes({ title: { toString: () => `evil" onclick="x` } })).toBe("");
  });

  it("does not throw on a null-prototype value", () => {
    expect(formatAttributes({ title: Object.create(null) })).toBe("");
  });
});

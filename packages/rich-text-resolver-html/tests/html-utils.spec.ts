import { describe, expect, it } from "vitest";
import { escapeHtmlAttribute, formatAttributes } from "../src/html-utils.js";

describe("escapeHtmlAttribute", () => {
  it("escapes every character that can break out of an attribute", () => {
    expect(escapeHtmlAttribute(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("escapes unconditionally, including input that looks already encoded", () => {
    // the parser decodes entities before serialization, so every & here is a literal &
    expect(escapeHtmlAttribute("&amp;")).toBe("&amp;amp;");
  });

  it("leaves ordinary values untouched", () => {
    expect(escapeHtmlAttribute("https://example.com/image.png")).toBe(
      "https://example.com/image.png",
    );
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

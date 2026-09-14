import { describe, expect, test } from "vitest";
import {
  browserParse,
  escapeHtml,
  nodeParse,
  nodesToHTML,
  nodesToHTMLAsync,
} from "../../../src/index.js";

describe("escapeHtml", () => {
  test("escapes every character that can break out of text or an attribute", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  test("escapes unconditionally, including input that looks already encoded", () => {
    expect(escapeHtml("&amp;")).toBe("&amp;amp;");
  });

  test("leaves ordinary values untouched", () => {
    expect(escapeHtml("https://example.com/image.png")).toBe("https://example.com/image.png");
  });
});

describe.each([
  ["node", nodeParse],
  ["browser", browserParse],
] as const)("HTML encoding (%s parser)", (_, parse) => {
  const input =
    '<p>AT&amp;T 1 &lt; 2 &lt;strong&gt;x&lt;/strong&gt; &amp;copy; <a href="https://example.com/?a=1&amp;b=2" title="say &quot;hi&quot;">link</a></p>';

  test("escapes text and attribute values", () => {
    expect(nodesToHTML(parse(input), {})).toBe(input);
  });

  test("escapes text and attribute values (async)", async () => {
    expect(await nodesToHTMLAsync(parse(input), {})).toBe(input);
  });

  test("passes escaped children and decoded attributes to custom transformers", () => {
    const output = nodesToHTML(parse('<p title="A&amp;B">&lt;b&gt;</p>'), {
      p: (node, children) => `${node.attributes.title}|${children}`,
    });

    expect(output).toBe("A&B|&lt;b&gt;");
  });
});

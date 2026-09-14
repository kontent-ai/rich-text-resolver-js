import { describe, expect, test } from "vitest";
import {
  browserParse,
  type DomNode,
  type NodeToHtml,
  type NodeToHtmlOptions,
  nodeParse,
  nodesToHTML,
  nodesToHTMLAsync,
} from "../../../src/index.js";

describe.each(["sync", "async"] as const)("HTML encoding (%s)", (mode) => {
  const serialize = (nodes: DomNode[], options?: NodeToHtmlOptions) =>
    mode === "sync"
      ? nodesToHTML(nodes, {}, undefined, undefined, options)
      : nodesToHTMLAsync(nodes, {}, undefined, undefined, options);

  describe.each([
    ["node", nodeParse],
    ["browser", browserParse],
  ] as const)("%s parser", (_, parse) => {
    test("keeps encoded scripts and event handlers as text inside nested elements", async () => {
      const input =
        '<p><span>&lt;script&gt;window.probe=1&lt;/script&gt;&lt;img src=x onerror="window.probe=1"&gt;</span></p>';
      const output = await serialize(parse(input));
      const document = new DOMParser().parseFromString(output, "text/html");

      expect(output).toBe(input);
      expect(document.querySelector("script, img, [onerror]")).toBeNull();
      expect(document.querySelector("span")?.textContent).toBe(
        '<script>window.probe=1</script><img src=x onerror="window.probe=1">',
      );
    });

    test("preserves text and attribute values over repeated round trips", async () => {
      const input =
        '<p><a href="https://example.com/?a=1&amp;b=2" title="say &quot;hello&quot; &amp; &lt;world&gt; &amp;quot;">AT&amp;T &lt; &gt; &amp;copy;&nbsp;</a></p>';
      const original = new DOMParser().parseFromString(input, "text/html").querySelector("a")!;
      let output = input;

      for (let index = 0; index < 3; index++) {
        output = await serialize(parse(output));
        const link = new DOMParser().parseFromString(output, "text/html").querySelector("a")!;
        expect(link.textContent).toBe(original.textContent);
        expect(link.getAttribute("title")).toBe(original.getAttribute("title"));
        expect(link.getAttribute("href")).toBe(original.getAttribute("href"));
      }
    });

    test("keeps decoded attribute quotes from creating attributes or elements", async () => {
      const input =
        '<p><a title="hello&quot; onmouseover=&quot;window.probe=1&quot;&gt;&lt;script&gt;window.probe=1&lt;/script&gt;">link</a></p>';
      const output = await serialize(parse(input));
      const document = new DOMParser().parseFromString(output, "text/html");

      expect(document.querySelector("[onmouseover], script")).toBeNull();
      expect(document.querySelector("a")?.getAttributeNames()).toEqual(["title"]);
      expect(document.querySelector("a")?.getAttribute("title")).toBe(
        'hello" onmouseover="window.probe=1"><script>window.probe=1</script>',
      );
    });

    test("disables text and attribute escaping throughout the tree when opted out", async () => {
      const input =
        '<div><p title="say &quot;hello&quot;">AT&amp;T &lt;strong&gt;text&lt;/strong&gt;</p></div>';

      expect(await serialize(parse(input), { escapeHtml: false })).toBe(
        '<div><p title="say "hello"">AT&T <strong>text</strong></p></div>',
      );
    });
  });

  test("escapes manually constructed text and attributes and omits undefined attributes", async () => {
    const nodes: DomNode[] = [{
      type: "tag",
      tagName: "p",
      attributes: { title: '"\'&<>', missing: undefined },
      children: [{ type: "text", content: '"\'&<>' }],
    }];

    expect(await serialize(nodes, { escapeHtml: true })).toBe(
      '<p title="&quot;&#39;&amp;&lt;&gt;">"\'&amp;&lt;&gt;</p>',
    );
  });

  test.each([true, false])(
    "preserves custom markup and context handling with escapeHtml=%s",
    async (escapeHtml) => {
      type Context = { depth: number };
      const nodes = nodeParse('<div><span title="A&amp;B">&lt;b&gt;</span></div>');
      const contextHandler = (_: DomNode, context: Context): Context => ({
        depth: context.depth + 1,
      });
      const transformer: NodeToHtml<Context> = (node, children, context) => {
        if (node.tagName === "span") {
          expect(node.attributes.title).toBe("A&B");
          expect(children).toBe(escapeHtml ? "&lt;b&gt;" : "<b>");
        }
        return `<section data-depth="${context?.depth}">${children}</section>`;
      };
      const output = mode === "sync"
        ? nodesToHTML(nodes, { "*": transformer }, { depth: 0 }, contextHandler, { escapeHtml })
        : await nodesToHTMLAsync(
            nodes,
            { "*": async (...args) => transformer(...args) },
            { depth: 0 },
            contextHandler,
            { escapeHtml },
          );

      expect(output).toBe(
        `<section data-depth="1"><section data-depth="2">${escapeHtml ? "&lt;b&gt;" : "<b>"}</section></section>`,
      );
    },
  );

  test("applies the same text escaping inside raw-text elements with an opt-out", async () => {
    const nodes: DomNode[] = [{
      type: "tag",
      tagName: "script",
      attributes: {},
      children: [{ type: "text", content: "if (a < b && c > d) {}" }],
    }];

    expect(await serialize(nodes)).toBe(
      "<script>if (a &lt; b &amp;&amp; c &gt; d) {}</script>",
    );
    expect(await serialize(nodes, { escapeHtml: false })).toBe(
      "<script>if (a < b && c > d) {}</script>",
    );
  });
});

import {
  type DomHtmlNode,
  type DomNode,
  isElement,
  parseHTML,
  transformToPortableText,
} from "@kontent-ai/rich-text-resolver";
import { describe, expect, it } from "vitest";
import { toHTML } from "../src/index.js";

/**
 * Regression tests for stored-XSS via attribute injection.
 *
 * Threat: a content editor with MAPI write access stores a `"` in a link's
 * `title` (or any other attribute reflected through `<a>`/`<img>`). DAPI
 * encodes it once as `&quot;`. The HTML parser inside `transformToPortableText`
 * decodes it to a literal `"`. If the renderer doesn't re-escape on emit,
 * the output breaks attribute quoting and an attacker-controlled
 * `onmouseover`/`onerror` handler ends up in the rendered DOM.
 *
 * Each test re-parses the rendered output with the same HTML parser a
 * browser would use, then asserts no element ended up with an event-handler
 * attribute. Avoids regex heuristics that can't distinguish "inside attr
 * value" from "is an attr".
 */

const collectAttributeNames = (nodes: ReadonlyArray<DomNode>): ReadonlySet<string> => {
  const names = new Set<string>();
  const walk = (node: DomNode) => {
    if (isElement(node)) {
      const element = node as DomHtmlNode;
      for (const name of Object.keys(element.attributes)) {
        names.add(name.toLowerCase());
      }
      element.children.forEach(walk);
    }
  };
  nodes.forEach(walk);
  return names;
};

const expectNoEventHandlerAttributes = (renderedHtml: string) => {
  const parsed = parseHTML(renderedHtml);
  const attrNames = collectAttributeNames(parsed);
  const eventHandlers = [...attrNames].filter((n) => /^on[a-z]+$/.test(n));
  expect(eventHandlers, `unexpected event handler attributes in: ${renderedHtml}`).toEqual([]);
};

describe("XSS regression — attribute escape on emit", () => {
  it("escapes a literal `\"` injected in <a title=...> via DAPI single-encoded &quot;", () => {
    const dapiHtml =
      '<p><a href="https://example.com" title="hello&quot; onmouseover=&quot;alert(1)">link</a></p>';

    const out = toHTML(transformToPortableText(dapiHtml));

    expectNoEventHandlerAttributes(out);
  });

  it("escapes a literal `\"` in an <img alt> attribute", () => {
    const dapiHtml =
      '<figure data-asset-id="abc"><img src="https://x/y.png" alt="x&quot; onerror=&quot;alert(1)" data-asset-id="abc"></figure>';

    const out = toHTML(transformToPortableText(dapiHtml));

    expectNoEventHandlerAttributes(out);
  });

  it("preserves Kontent's encoding under repeated round-trips (no decay)", () => {
    const dapiHtml =
      '<p><a href="https://example.com" title="hello&quot; onmouseover=&quot;alert(1)">link</a></p>';

    const out1 = toHTML(transformToPortableText(dapiHtml));
    const out2 = toHTML(transformToPortableText(out1));
    const out3 = toHTML(transformToPortableText(out2));

    expectNoEventHandlerAttributes(out1);
    expectNoEventHandlerAttributes(out2);
    expectNoEventHandlerAttributes(out3);
  });
});

import { match } from "ts-pattern";

import type { DomHtmlNode, DomNode } from "../../parser/parser-models.js";

export type NodeToHtml<TContext = unknown> = (
  node: DomHtmlNode<unknown>,
  children: string,
  context?: TContext,
) => string;

export type NodeToHtmlAsync<TContext = unknown> = (
  node: DomHtmlNode<unknown>,
  children: string,
  context?: TContext,
) => Promise<string>;

/**
 * A record of functions that convert an HTML node and its children to a string.
 *
 * @template TContext - The type of contextual data passed to the conversion functions.
 */
export type NodeToHtmlMap<TContext = unknown> = Record<string, NodeToHtml<TContext>>;

/**
 * A record of async functions that convert an HTML node and its children to a string.
 *
 * @template TContext - The type of contextual data passed to the conversion functions.
 */
export type AsyncNodeToHtmlMap<TContext = unknown> = Record<string, NodeToHtmlAsync<TContext>>;

export type NodeToHtmlOptions = {
  /**
   * Escape text nodes and default attribute values for HTML output. Defaults to true.
   * Set to false to retain legacy unescaped output.
   */
  escapeHtml?: boolean;
};

/**
 * Recursively traverses an array of `DomNode`, transforming each tag node to its HTML string representation, including all attributes.
 * You can override transformation for individual tags by providing a custom transformer via `transformers` parameter. Text nodes are transformed automatically.
 * An optional context object and a handler to update it before a tag node is processed can be provided.
 *
 * @template TContext - The type of the context object used during traversal.
 *
 * @param {DomNode[]} nodes - The array of `DomNode` elements to traverse and transform.
 * @param {NodeToHtmlMap<TContext>} transformers - Record of `tag : function` pairs defining transformations for individual tags.
 * A wildcard `*` tag can be used for defining a transformation for all tags for which a custom transformation wasn't specified.
 * @param {TContext} [context={}] - The initial context object passed to transformers and updated by the `contextHandler`. Empty object by default.
 * @param {(node: DomNode, context: TContext) => TContext} [contextHandler] - An optional function that updates the context based on the current tag node.
 * @param {NodeToHtmlOptions} [options={}] - Output options. Set `escapeHtml: false` for legacy unescaped output.
 *
 * @returns {string} HTML or other string result of the transformation.
 *
 * @remarks
 * - The function traverses and transforms the nodes in a depth-first manner.
 * - If a `contextHandler` is provided, it updates the context before passing it to child nodes traversal.
 *
 * Text (including script/style content) and default attribute values are HTML-escaped.
 * Set `options.escapeHtml` to false for legacy output. Custom transformers receive
 * transformed children and decoded attributes; their output is verbatim, so they must
 * escape any attributes they serialize.
 *
 * This is not a sanitizer. Sanitize final output before rendering untrusted HTML.
 */
export const nodesToHTML = <TContext>(
  nodes: DomNode[],
  transformers: NodeToHtmlMap<TContext>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
  options: NodeToHtmlOptions = {},
): string =>
  nodes
    .map((node) =>
      match(node)
        .with({ type: "text" }, (textNode) =>
          options.escapeHtml === false ? textNode.content : escapeHtmlText(textNode.content),
        )
        .with({ type: "tag" }, (tagNode) => {
          const updatedContext = contextHandler?.(tagNode, context) ?? context;
          const children = nodesToHTML(
            tagNode.children,
            transformers,
            updatedContext,
            contextHandler,
            options,
          );
          const transformer = transformers[tagNode.tagName] ?? transformers["*"];

          return (
            transformer?.(tagNode, children, updatedContext) ??
            `<${tagNode.tagName}${formatAttributes(
              tagNode.attributes,
              options,
            )}>${children}</${tagNode.tagName}>`
          );
        })
        .exhaustive(),
    )
    .join("");

/**
 * Recursively traverses an array of `DomNode`, transforming each tag node to its HTML string representation in an asynchronous manner.
 * You can override transformation for individual tags by providing a custom transformer via `transformers` parameter. Text nodes are transformed automatically.
 * An optional context object and a handler to update it before a tag node is processed can be provided.
 *
 * @template TContext - The type of the context object used during traversal.
 *
 * @param {DomNode[]} nodes - The array of `DomNode` elements to traverse and transform.
 * @param {AsyncNodeToHtmlMap<TContext>} transformers - Record of `tag : function` pairs defining async transformations for individual tags.
 * A wildcard `*` tag can be used for defining a transformation for all tags for which a custom transformation wasn't specified.
 * @param {TContext} [context={}] - The initial context object passed to transformers and updated by the `contextHandler`. Empty object by default.
 * @param {(node: DomNode, context: TContext) => TContext} [contextHandler] - An optional function that updates the context based on the current tag node.
 * @param {NodeToHtmlOptions} [options={}] - Output options. Set `escapeHtml: false` for legacy unescaped output.
 *
 * @returns {Promise<string>} HTML or other string result of the transformation.
 *
 * @remarks
 * - The function traverses and transforms the nodes in a depth-first manner.
 * - If a `contextHandler` is provided, it updates the context before passing it to child nodes traversal.
 *
 * Text (including script/style content) and default attribute values are HTML-escaped.
 * Set `options.escapeHtml` to false for legacy output. Custom transformers receive
 * transformed children and decoded attributes; their output is verbatim, so they must
 * escape any attributes they serialize.
 *
 * This is not a sanitizer. Sanitize final output before rendering untrusted HTML.
 */
export const nodesToHTMLAsync = async <TContext>(
  nodes: DomNode[],
  transformers: AsyncNodeToHtmlMap<TContext>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
  options: NodeToHtmlOptions = {},
): Promise<string> =>
  (
    await Promise.all(
      nodes.map(async (node) =>
        match(node)
          .with({ type: "text" }, (textNode) =>
            options.escapeHtml === false ? textNode.content : escapeHtmlText(textNode.content),
          )
          .with({ type: "tag" }, async (tagNode) => {
            const updatedContext = contextHandler?.(tagNode, context) ?? context;
            const children = await nodesToHTMLAsync(
              tagNode.children,
              transformers,
              updatedContext,
              contextHandler,
              options,
            );
            const transformer = transformers[tagNode.tagName] ?? transformers["*"];

            return (
              (await transformer?.(tagNode, children, updatedContext)) ??
              `<${tagNode.tagName}${formatAttributes(
                tagNode.attributes,
                options,
              )}>${children}</${tagNode.tagName}>`
            );
          })
          .exhaustive(),
      ),
    )
  ).join("");

const escapeHtmlText = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const escapeHtmlAttribute = (value: string): string =>
  escapeHtmlText(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const formatAttributes = (
  attributes: Record<string, string | undefined>,
  options: NodeToHtmlOptions,
): string =>
  Object.entries(attributes)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(
      ([key, value]) =>
        ` ${key}="${options.escapeHtml === false ? value : escapeHtmlAttribute(value)}"`,
    )
    .join(" ");

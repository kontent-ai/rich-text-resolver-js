import { match, P } from "ts-pattern";

import { DomHtmlNode, DomNode, DomTextNode } from "../../parser/parser-models.js";

export type NodeTransformer<T extends DomNode, U, V> = (
  node: T,
  children: V[],
  context?: U,
) => V[];

export type AsyncNodeTransformer<T extends DomNode, U, V> = (
  node: T,
  children: V[],
  context?: U,
) => Promise<V[]>;

export type Transformers<TContext, V> = {
  text: NodeTransformer<DomTextNode, TContext, V>;
  tag: Record<string, NodeTransformer<DomHtmlNode<any>, TContext, V>>;
};

export type AsyncTransformers<TContext, V> = {
  text: AsyncNodeTransformer<DomTextNode, TContext, V>;
  tag: Record<string, AsyncNodeTransformer<DomHtmlNode<any>, TContext, V>>;
};

/**
 * Recursively traverses an array of `DomNodes`, transforming each node using the provided transform function.
 * The transformation begins from the deepest nodes and propagates intermediate results upwards through the recursion.
 * You can optionally provide a context object and a handler to update it before a node is processed.
 *
 * @template TContext - The type of the context object used during traversal.
 *
 * @param {DomNode[]} nodes - The array of `DomNode` elements to traverse and transform.
 * @param {NodeTransformer<DomNode, TContext, V>} transform - The function applied to each node to transform it. Takes current node, an array of already transformed subnodes and an optional context as arguments.
 * @param {TContext} [context={}] - The initial context object passed to the `transform` function and updated by the `contextHandler`. Empty object by default.
 * @param {(node: DomNode, context: TContext) => TContext} [contextHandler] - An optional function that updates the context based on the current node.
 *
 * @returns {V[]} Flattened array of transformed nodes.
 *
 * @remarks
 * - The function traverses and transforms the nodes in a depth-first manner.
 * - If a `contextHandler` is provided, it updates the context before passing it to child nodes traversal.
 */
export const traverseAndTransformNodes = <TContext, V>(
  nodes: DomNode[],
  transform: NodeTransformer<DomNode, TContext, V> | Transformers<TContext, V>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
): V[] => {
  return nodes.flatMap(node => {
    const updatedContext = contextHandler ? contextHandler(node, context) : context;

    const children = node.type === "tag"
      ? traverseAndTransformNodes(node.children, transform, updatedContext, contextHandler)
      : [];

    return match(transform)
      .with(P.when(t => typeof t === "function"), transformFunc => transformFunc(node, children, updatedContext))
      .otherwise(transformers =>
        match(node)
          .with({ type: "text" }, textNode => transformers.text(textNode, children, updatedContext))
          .with({ type: "tag" }, tagNode => {
            const transformer = transformers.tag[tagNode.tagName] ?? transformers.tag["*"];
            if (transformer) {
              return transformer(tagNode, children, updatedContext);
            }

            throw new Error(`No transformer specified for tag: ${tagNode.tagName}`);
          })
          .exhaustive()
      );
  });
};

/**
 * Recursively traverses an array of `DomNodes`, transforming each node using the provided transform function in an asynchronous matter.
 * The transformation begins from the deepest nodes and propagates intermediate results upwards through the recursion.
 * You can optionally provide a context object and a handler to update it before a node is processed.
 *
 * @template TContext - The type of the context object used during traversal.
 *
 * @param {DomNode[]} nodes - The array of `DomNode` elements to traverse and transform.
 * @param {AsyncNodeTransformer<DomNode, TContext, V>} transform - The function applied to each node to transform it. Takes current node, an array of already transformed subnodes and an optional context as arguments.
 * @param {TContext} [context={}] - The initial context object passed to the `transform` function and updated by the `contextHandler`. Empty object by default.
 * @param {(node: DomNode, context: TContext) => TContext} [contextHandler] - An optional function that updates the context based on the current node.
 *
 * @returns {Promise<V[]>} Flattened array of transformed nodes.
 *
 * @remarks
 * - The function traverses and transforms the nodes in a depth-first manner.
 * - If a `contextHandler` is provided, it updates the context before passing it to child nodes traversal.
 */
export const traverseAndTransformNodesAsync = async <TContext, V>(
  nodes: DomNode[],
  transform: AsyncNodeTransformer<DomNode, TContext, V> | AsyncTransformers<TContext, V>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
): Promise<V[]> => {
  const results = await Promise.all(
    nodes.map(async (node) => {
      const updatedContext = contextHandler?.(node, context) ?? context;

      const children = node.type === "tag"
        ? await traverseAndTransformNodesAsync(node.children, transform, updatedContext, contextHandler)
        : [];

      return match(transform)
        .with(P.when(t => typeof t === "function"), transformFunc => transformFunc(node, children, updatedContext))
        .otherwise(transformers =>
          match(node)
            .with({ type: "text" }, textNode => transformers.text(textNode, children, updatedContext))
            .with({ type: "tag" }, tagNode => {
              const transformer = transformers.tag[tagNode.tagName] ?? transformers.tag["*"];
              if (transformer) {
                return transformer(tagNode, children, updatedContext);
              }

              throw new Error(`No transformer specified for tag: ${tagNode.tagName}`);
            })
            .exhaustive()
        );
    }),
  );

  return results.flat();
};

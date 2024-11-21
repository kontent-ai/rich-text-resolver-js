import { DomNode } from "../../parser/parser-models.js";

export type TransformNodeFunction<T extends DomNode, U, V> = (
  node: T,
  processedItems: V[],
  context?: U,
) => V[];

export type TransformNodeFunctionAsync<T extends DomNode, U, V> = (
  node: T,
  processedItems: V[],
  context?: U,
) => Promise<V[]>;

/**
 * Recursively traverses an array of `DomNode` elements, transforming each node using the provided `transform` function.
 * You can optionally provide a context object and a handler to update it before a node is processed.
 *
 * @template TContext - The type of the context object used during traversal.
 *
 * @param {DomNode[]} nodes - The array of `DomNode` elements to traverse and transform.
 * @param {TransformNodeFunction<DomNode, TContext, any>} transform - The function applied to each node to transform it.
 * @param {TContext} [context={}] - The initial context object passed to the `transform` function and updated by the `contextHandler`. Empty object by default.
 * @param {(node: DomNode, context: TContext) => TContext} [contextHandler] - An optional function that updates the context based on the current node.
 *
 * @returns {ReturnType<typeof transform>} The transformed result after applying the `transform` function to all nodes.
 *
 * @remarks
 * - The function traverses and transforms the nodes in a depth-first manner.
 * - If a `contextHandler` is provided, it updates the context before passing it to child nodes traversal.
 */
export const traverseAndTransformNodes = <TContext, V>(
  nodes: DomNode[],
  transform: TransformNodeFunction<DomNode, TContext, V>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
): V[] =>
  nodes.flatMap(node => {
    const updatedContext = contextHandler?.(node, context) ?? context;
    const children = node.type === "tag"
      ? traverseAndTransformNodes(node.children, transform, updatedContext, contextHandler)
      : [];

    return transform(node, children, updatedContext);
  });

/**
 * Recursively traverses an array of `DomNode` elements, transforming each node using the provided `transform` function in an asynchronous manner.
 * You can optionally provide a context object and a handler to update it before a node is processed.
 *
 * @template TContext - The type of the context object used during traversal.
 *
 * @param {DomNode[]} nodes - The array of `DomNode` elements to traverse and transform.
 * @param {TransformNodeFunction<DomNode, TContext, V>} transform - The function applied to each node to transform it.
 * @param {TContext} [context={}] - The initial context object passed to the `transform` function and updated by the `contextHandler`. Empty object by default.
 * @param {(node: DomNode, context: TContext) => TContext} [contextHandler] - An optional function that updates the context based on the current node.
 *
 * @returns {Promise<V[]>} The transformed result after applying the `transform` function to all nodes.
 *
 * @remarks
 * - The function traverses and transforms the nodes in a depth-first manner.
 * - If a `contextHandler` is provided, it updates the context before passing it to child nodes traversal.
 */
export const traverseAndTransformNodesAsync = async <TContext, V>(
  nodes: DomNode[],
  transform: TransformNodeFunctionAsync<DomNode, TContext, V>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
): Promise<V[]> => {
  const results = await Promise.all(
    nodes.map(async (node) => {
      const updatedContext = contextHandler?.(node, context) ?? context;

      const children = node.type === "tag"
        ? await traverseAndTransformNodesAsync(node.children, transform, updatedContext, contextHandler)
        : [];

      return transform(node, children, updatedContext);
    }),
  );

  return results.flat();
};

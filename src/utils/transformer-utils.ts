import {
  ArbitraryTypedObject,
  PortableTextBlockStyle,
  PortableTextListItemType,
  PortableTextMarkDefinition,
  PortableTextSpan,
} from "@portabletext/types";
import ShortUniqueId from "short-unique-id";

import { DomNode } from "../parser/index.js";
import {
  ModularContentType,
  PortableTextComponentOrItem,
  PortableTextExternalLink,
  PortableTextImage,
  PortableTextItemLink,
  PortableTextMark,
  PortableTextObject,
  PortableTextStrictBlock,
  PortableTextStrictListItemBlock,
  PortableTextTable,
  PortableTextTableCell,
  PortableTextTableRow,
  Reference,
  ShortGuid,
  TextStyleElement,
} from "../transformers/index.js";

export type ResolverFunction<T extends ArbitraryTypedObject> = (
  value: T,
) => string;

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
 * - If a `contextHandler` is provided, it **clones** and updates the context before passing it to child nodes traversal.
 */
export const traverseAndTransformNodes = <TContext, V>(
  nodes: DomNode[],
  transform: TransformNodeFunction<DomNode, TContext, V>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
): V[] =>
  nodes.flatMap(node => {
    const updatedContext = contextHandler?.(node, context) ?? { ...context };
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
 * - If a `contextHandler` is provided, it **clones** and updates the context before passing it to child nodes traversal.
 */
export const traverseAndTransformNodesAsync = async <TContext, V>(
  nodes: DomNode[],
  transform: TransformNodeFunctionAsync<DomNode, TContext, V>,
  context: TContext = {} as TContext,
  contextHandler?: (node: DomNode, context: TContext) => TContext,
): Promise<V[]> => {
  const results = await Promise.all(
    nodes.map(async (node) => {
      const updatedContext = contextHandler?.(node, context) ?? { ...context };

      const children = node.type === "tag"
        ? await traverseAndTransformNodesAsync(node.children, transform, updatedContext, contextHandler)
        : [];

      return transform(node, children, updatedContext);
    }),
  );

  return results.flat();
};

/**
 * Recursively traverses and optionally transforms a Portable Text structure using a provided
 * callback function. The callback is applied to each node in the structure. If the callback
 * does not modify a node, the original node is used.
 *
 * @template T The type of the Portable Text nodes, defaulting to PortableTextObject.
 * @param {T} object - The root node of the Portable Text structure to be traversed.
 *   It can be a default Portable Text object or a custom type that extends from it.
 * @param {(object: T) => ArbitraryTypedObject | undefined} callback - A callback function
 *   invoked for each node in the Portable Text structure. It can return a modified version
 *   of the node or `undefined` if no modifications are to be made.
 * @returns {ArbitraryTypedObject} - A modified copy of the original portable text structure.
 */
export const traversePortableText = <
  T extends ArbitraryTypedObject = PortableTextObject,
>(
  nodes: T[],
  callback: (node: T) => ArbitraryTypedObject | undefined,
): ArbitraryTypedObject[] => {
  return nodes.map((node) => {
    // Apply the callback to the current node. If it returns undefined, clone the node.
    const traversedNode = callback(node) ?? { ...node };

    Object.keys(traversedNode).forEach((key) => {
      // marks is an array of strings that shouldn't be modified, therefore omit from traversal
      if (Array.isArray(traversedNode[key]) && key !== "marks") {
        traversedNode[key] = traversePortableText(
          traversedNode[key],
          callback,
        );
      }
    });

    return traversedNode;
  });
};

export const createSpan = (
  guid: ShortGuid,
  marks?: string[],
  text?: string,
): PortableTextSpan => ({
  _type: "span",
  _key: guid,
  marks: marks || [],
  text: text || "",
});

export const createBlock = (
  guid: ShortGuid,
  markDefs?: PortableTextMarkDefinition[],
  style?: PortableTextBlockStyle,
  children?: PortableTextSpan[],
): PortableTextStrictBlock => ({
  _type: "block",
  _key: guid,
  markDefs: markDefs || [],
  style: style || "normal",
  children: children || [],
});

export const createListBlock = (
  guid: ShortGuid,
  level?: number,
  listItem?: PortableTextListItemType,
  markDefs?: PortableTextMarkDefinition[],
  style?: string,
  children?: PortableTextSpan[],
): PortableTextStrictListItemBlock => ({
  _type: "block",
  _key: guid,
  markDefs: markDefs || [],
  level: level,
  listItem: listItem ?? "unknown",
  style: style || "normal",
  children: children || [],
});

export const createImageBlock = (
  guid: ShortGuid,
  reference: string,
  url: string,
  alt?: string,
  referenceType?: "codename" | "external-id" | "id",
): PortableTextImage => ({
  _type: "image",
  _key: guid,
  asset: {
    _type: "reference",
    _ref: reference,
    url,
    alt,
    referenceType,
  },
});

export const createExternalLink = (
  guid: ShortGuid,
  attributes: Readonly<Record<string, string | undefined>>,
): PortableTextExternalLink => ({
  _key: guid,
  _type: "link",
  ...attributes,
});

export const createItemLink = (
  guid: ShortGuid,
  reference: string,
): PortableTextItemLink => ({
  _key: guid,
  _type: "contentItemLink",
  reference: {
    _type: "reference",
    _ref: reference,
  },
});

export const createTable = (
  guid: ShortGuid,
  rows?: PortableTextTableRow[],
): PortableTextTable => ({
  _key: guid,
  _type: "table",
  rows: rows ?? [],
});

export const createTableRow = (guid: ShortGuid, cells?: PortableTextTableCell[]): PortableTextTableRow => ({
  _key: guid,
  _type: "row",
  cells: cells ?? [],
});

export const createTableCell = (
  guid: ShortGuid,
  content?: PortableTextObject[],
): PortableTextTableCell => ({
  _key: guid,
  _type: "cell",
  content: content ?? [],
});

export const createMark = (
  guid: ShortGuid,
  value: TextStyleElement | string,
  childCount: number,
): PortableTextMark => ({
  _type: "mark",
  _key: guid,
  value: value,
  childCount: childCount,
});

export const createComponentOrItemBlock = (
  guid: ShortGuid,
  reference: Reference,
  dataType: ModularContentType,
): PortableTextComponentOrItem => ({
  _type: "componentOrItem",
  _key: guid,
  dataType,
  component: reference,
});

export const getAllNewLineAndWhiteSpace = /\n\s*/g;

export const { randomUUID } = new ShortUniqueId({ length: 10 });

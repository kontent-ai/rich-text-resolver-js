import {
  ArbitraryTypedObject,
  PortableTextBlockStyle,
  PortableTextListItemType,
  PortableTextMarkDefinition,
  PortableTextSpan,
} from "@portabletext/types";
import ShortUniqueId from "short-unique-id";

import { DomHtmlNode, DomTextNode } from "../parser/index.js";
import {
  ModularContentType,
  PortableTextComponent,
  PortableTextExternalLink,
  PortableTextImage,
  PortableTextInternalLink,
  PortableTextItem,
  PortableTextLink,
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

export type TransformLinkFunction<TElementAttributes = Record<string, string | undefined>> = (
  node: DomHtmlNode<TElementAttributes>,
) => [PortableTextLink, PortableTextMark];
export type TransformElementFunction<TElementAttributes = Record<string, string | undefined>> = (
  node: DomHtmlNode<TElementAttributes>,
) => PortableTextItem[];
export type TransformListItemFunction = (
  node: DomHtmlNode,
  depth: number,
  listType: PortableTextListItemType,
) => PortableTextStrictListItemBlock[];
export type TransformTextFunction = (node: DomTextNode) => PortableTextSpan;
export type TransformTableCellFunction = (node: DomHtmlNode) => PortableTextItem[];
export type TransformFunction = TransformElementFunction<any> | TransformListItemFunction;

export type MergePortableTextItemsFunction = (itemsToMerge: ReadonlyArray<PortableTextItem>) => PortableTextItem[];
export type ResolverFunction<T extends ArbitraryTypedObject> = (value: T) => string;

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
export const traversePortableText = <T extends ArbitraryTypedObject = PortableTextObject>(
  object: T,
  callback: (object: T) => ArbitraryTypedObject | undefined,
): ArbitraryTypedObject => {
  // ensure a deep copy is created instead of modifying the original object
  const traversedObject = callback(object) ?? { ...object };

  Object.keys(traversedObject).forEach((key) => {
    // marks is an array of strings that shouldn't be modified, therefore omit from traversal
    if (Array.isArray(traversedObject[key]) && key !== "marks") {
      traversedObject[key] = traversedObject[key].map(
        (child: T) => traversePortableText(child, callback),
      );
    }
  });

  return traversedObject;
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
  level: number,
  listItem: PortableTextListItemType,
  markDefs?: PortableTextMarkDefinition[],
  style?: string,
  children?: PortableTextSpan[],
): PortableTextStrictListItemBlock => ({
  _type: "block",
  _key: guid,
  markDefs: markDefs || [],
  level: level,
  listItem: listItem,
  style: style || "normal",
  children: children || [],
});

export const createImageBlock = (guid: ShortGuid, reference: string, url: string, alt?: string): PortableTextImage => ({
  _type: "image",
  _key: guid,
  asset: {
    _type: "reference",
    _ref: reference,
    url,
    alt,
  },
});

export const createTableBlock = (
  guid: ShortGuid,
  columns: number,
): PortableTextTable => ({
  _type: "table",
  _key: guid,
  numColumns: columns,
  rows: [],
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
): PortableTextInternalLink => ({
  _key: guid,
  _type: "internalLink",
  reference: {
    _type: "reference",
    _ref: reference,
  },
});

export const createTable = (
  guid: ShortGuid,
  numColumns: number,
): PortableTextTable => ({
  _key: guid,
  _type: "table",
  numColumns: numColumns,
  rows: [],
});

export const createTableRow = (guid: ShortGuid): PortableTextTableRow => ({
  _key: guid,
  _type: "row",
  cells: [],
});

export const createTableCell = (
  guid: ShortGuid,
  childCount: number,
): PortableTextTableCell => ({
  _key: guid,
  _type: "cell",
  content: [],
  childBlocksCount: childCount,
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

export const createComponentBlock = (
  guid: ShortGuid,
  reference: Reference,
  dataType: ModularContentType,
): PortableTextComponent => ({
  _type: "component",
  _key: guid,
  dataType,
  component: reference,
});

export const compose = <T>(
  firstFunction: (argument: T) => T,
  ...functions: ReadonlyArray<(argument: T) => T>
) =>
  functions.reduce(
    (previousFunction, nextFunction) => (value) => previousFunction(nextFunction(value)),
    firstFunction,
  );

export const getAllNewLineAndWhiteSpace = /\n\s*/g;

export const { randomUUID } = new ShortUniqueId({ length: 10 });

import { ArbitraryTypedObject, PortableTextBlockStyle, PortableTextListItemType, PortableTextMarkDefinition, PortableTextSpan } from "@portabletext/types"
import ShortUniqueId from "short-unique-id";

import { IDomHtmlNode, IDomTextNode } from "../parser/index.js";
import {
  PortableTextComponent,
  PortableTextExternalLink,
  PortableTextImage,
  PortableTextInternalLink,
  PortableTextItem,
  PortableTextLink,
  PortableTextLinkMark,
  PortableTextStrictBlock,
  PortableTextStrictListItemBlock,
  PortableTextStyleMark,
  PortableTextTable,
  PortableTextTableCell,
  PortableTextTableRow,
  Reference,
} from "../transformers/transformer-models.js";

export const textStyleElements = ['strong', 'em', 'sub', 'sup', 'code'] as const;
export const blockElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export const ignoredElements = ['img', 'tbody', 'ol', 'ul'] as const;
export const tableElements = ['table', 'td', 'tr'] as const;
export const lineBreakElement = 'br' as const;
export const anchorElement = 'a' as const;
export const objectElement = 'object' as const;
export const assetElement = 'figure' as const;
export const listItemElement = 'li' as const;
export const markElements = [...textStyleElements, anchorElement] as const;
export const allElements = [
    ...blockElements,
    ...ignoredElements,
    ...markElements,
    ...tableElements,
    assetElement,
    objectElement,
    lineBreakElement,
    listItemElement,
  ] as const;

export type TextStyleElement = typeof textStyleElements[number];
export type BlockElement = typeof blockElements[number];
export type IgnoredElement = typeof ignoredElements[number];
export type MarkElement = typeof markElements[number];
export type ValidElement = typeof allElements[number];

export type TransformLinkFunction = (node: IDomHtmlNode) => [PortableTextLink, PortableTextMark];
export type TransformElementFunction = (node: IDomHtmlNode) => PortableTextItem[];
export type TransformListItemFunction = (node: IDomHtmlNode, depth: number, listType: PortableTextListItemType) => PortableTextStrictListItemBlock[];
export type TransformTextFunction = (node: IDomTextNode) => PortableTextSpan;
export type TransformTableCellFunction = (node: IDomHtmlNode) => PortableTextItem[];
export type TransformFunction = TransformElementFunction | TransformListItemFunction;

export type MergePortableTextItemsFunction = (itemsToMerge: ReadonlyArray<PortableTextItem>) => PortableTextItem[];

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
  callback: (object: T) => ArbitraryTypedObject | undefined
): ArbitraryTypedObject => {
  // ensure a deep copy is created instead of modifying the original object
  const traversedObject = callback(object) ?? {...object};

  Object.keys(traversedObject).forEach((key) => {
    // marks is an array of strings that shouldn't be modified, therefore omit from traversal
    if (Array.isArray(traversedObject[key]) && key !== "marks") {
      traversedObject[key] = traversedObject[key].map(
        (child: T) => traversePortableText(child, callback)
      );
    }
  });

  return traversedObject;
};

export const createSpan = (
  guid: string,
  marks?: string[],
  text?: string
): PortableTextSpan => {
  return {
    _type: "span",
    _key: guid,
    marks: marks || [],
    text: text || "",
  };
};

export const createBlock = (
  guid: string,
  markDefs?: PortableTextMarkDefinition[],
  style?: PortableTextBlockStyle,
  children?: PortableTextSpan[]
): PortableTextStrictBlock => {
  return {
    _type: "block",
    _key: guid,
    markDefs: markDefs || [],
    style: style || "normal",
    children: children || [],
  };
};

export const createListBlock = (
  guid: string,
  level: number,
  listItem: PortableTextListItemType,
  markDefs?: PortableTextMarkDefinition[],
  style?: string,
  children?: PortableTextSpan[]
): PortableTextStrictListItemBlock => {
  return {
    _type: "block",
    _key: guid,
    markDefs: markDefs || [],
    level: level,
    listItem: listItem,
    style: style || "normal",
    children: children || [],
  };
};

export const createImageBlock = (guid: string): PortableTextImage => {
  return {
    _type: "image",
    _key: guid,
    asset: {
      _type: "reference",
      _ref: "",
      url: "",
    },
  };
};

export const createTableBlock = (
  guid: string,
  columns: number
): PortableTextTable => {
  return {
    _type: "table",
    _key: guid,
    numColumns: columns,
    rows: [],
  };
};

export const createItemLink = (
  guid: string,
  reference: string
): PortableTextInternalLink => {
  return {
    _key: guid,
    _type: "internalLink",
    reference: {
      _type: "reference",
      _ref: reference,
    },
  };
};

export const createTable = (
  guid: string,
  numColumns: number
): PortableTextTable => {
  return {
    _key: guid,
    _type: "table",
    numColumns: numColumns,
    rows: [],
  };
};

export const createTableRow = (guid: string): PortableTextTableRow => {
  return {
    _key: guid,
    _type: "row",
    cells: [],
  };
};

export const createTableCell = (
  guid: string,
  childCount: number
): PortableTextTableCell => {
  return {
    _key: guid,
    _type: "cell",
    content: [],
    childBlocksCount: childCount,
  };
};

export const createExternalLink = (
  guid: string,
  attributes: Readonly<Record<string, string>>
): PortableTextExternalLink => {
  return {
    _key: guid,
    _type: "link",
    ...attributes,
  };
};

export const createStyleMark = (
  guid: string,
  value: string,
): PortableTextStyleMark => {
  return {
    _type: "mark",
    _key: guid,
    value: value
  };
};

export const createLinkMark = (
    guid: string,
    value: string,
    childCount: number
): PortableTextLinkMark => {
  return {
      _type: "linkMark",
      _key: guid,
      value: value,
      childCount: childCount
  };
};

export const createComponentBlock = (
  guid: string,
  reference: Reference
): PortableTextComponent => {
  return {
    _type: "component",
    _key: guid,
    component: reference,
  };
};

export const compose = <T>(
  firstFunction: (argument: T) => T,
  ...functions: ReadonlyArray<(argument: T) => T>
) =>
  functions.reduce(
    (previousFunction, nextFunction) => (value) =>
      previousFunction(nextFunction(value)),
    firstFunction
  );

export const resolveTable = (
  table: PortableTextTable,
  resolver: (value: any) => string
): string => {
  let tableHtml = "<table><tbody>";
  const resolveCell = (cell: PortableTextTableCell) => {
    tableHtml += "<td>";
    for (let j = 0; j < cell.childBlocksCount; j++) {
      tableHtml += resolver(cell.content);
    }
    tableHtml += "</td>";
  };
  for (let i = 0; i < table.numColumns; i++) {
    const currentRow = table.rows[i];
    tableHtml += "<tr>";
    currentRow.cells.forEach(resolveCell);
    tableHtml += "</tr>";
  }
  tableHtml += "</tbody></table>";
  return tableHtml;
};

export const getAllNewLineAndWhiteSpace = /\n\s*/g;

export const uid = new ShortUniqueId.default({length: 16});


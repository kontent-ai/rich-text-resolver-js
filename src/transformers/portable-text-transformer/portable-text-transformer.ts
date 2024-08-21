import { PortableTextBlock, PortableTextListItemType } from "@portabletext/types";

import {
  DomHtmlNode,
  DomNode,
  FigureElementAttributes,
  ImgElementAttributes,
  ObjectElementAttributes,
  ParseResult,
} from "../../parser/index.js";
import {
  BlockElement,
  IgnoredElement,
  MarkElement,
  ModularContentType,
  PortableTextItem,
  PortableTextLink,
  PortableTextObject,
  PortableTextStrictBlock,
  PortableTextTable,
  PortableTextTableRow,
  Reference,
  ShortGuid,
  TextStyleElement,
  ValidElement,
} from "../../transformers/index.js";
import {
  blockElements,
  compose,
  countChildTextNodes,
  createBlock,
  createComponentBlock,
  createExternalLink,
  createImageBlock,
  createItemLink,
  createListBlock,
  createMark,
  createSpan,
  createTable,
  createTableCell,
  createTableRow,
  ignoredElements,
  isElement,
  isItemLink,
  isListBlock,
  isListItem,
  isText,
  isUnorderedListBlock,
  lineBreakElement,
  markElements,
  MergePortableTextItemsFunction,
  randomUUID,
  textStyleElements,
  TransformElementFunction,
  TransformFunction,
  TransformLinkFunction,
  TransformListItemFunction,
  TransformTableCellFunction,
  TransformTextFunction,
} from "../../utils/index.js";

/**
 * Transforms a parsed tree into an array of Portable Text Blocks.
 *
 * This function takes the parsed tree of a rich text content, flattens it to an array of intermediate
 * Portable Text Objects, and then composes and merges these objects into an array of Portable Text Blocks.
 *
 * @param {ParseResult} parsedTree The parsed tree structure representing the rich text content.
 * @returns {PortableTextObject[]} An array of Portable Text Blocks representing the structured content.
 */
export const transformToPortableText = (parsedTree: ParseResult): PortableTextObject[] =>
  composeAndMerge(flatten(parsedTree.children)) as PortableTextObject[];

/**
 * Iterates over the array of `PortableTextObjects` to find the last text block. If found, it adds a link item
 * to its `markDef` array. If no text block is found (which can happen in structures like tables), a new text
 * block is created with the link item and pushed to `mergedItems` array.
 *
 * @param {PortableTextItem[]} mergedItems - The array of PortableTextItems being processed.
 * @param {PortableTextLink} linkItem - The link item (either internal or external) to be added to the text block's mark definitions.
 */
const handleLinks = (mergedItems: PortableTextItem[], linkItem: PortableTextLink) => {
  const lastBlock = mergedItems.findLast((item): item is PortableTextStrictBlock => item._type === "block");

  if (lastBlock) {
    (lastBlock.markDefs ||= []).push(linkItem);
  } else {
    mergedItems.push(createBlock(randomUUID(), [linkItem]));
  }
};

/**
 * Merges spans and marks into an array of `PortableTextObjects`.
 *
 * @param {ReadonlyArray<PortableTextItem>} itemsToMerge - The array of PortableTextItems to be merged.
 * @returns {PortableTextItem[]} The array of PortableTextItems after merging spans and marks.
 */
const mergeSpansAndMarks: MergePortableTextItemsFunction = (itemsToMerge) => {
  /**
   * mutable array of tuples, each containing either a style mark or a guid reference to an anchor link,
   * in a number corresponding to total number of child text nodes that the mark should affect.
   */
  let markSets: (TextStyleElement | ShortGuid)[][] = [];

  return itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
    switch (item._type) {
      case "internalLink":
      case "link":
        handleLinks(mergedItems, item);
        break;
      case "mark":
        markSets.push(Array(item.childCount).fill(item.value));
        break;
      case "span":
        /**
         * mutate markSets array by popping a single mark from each tuple and assign it
         * to the span's marks array. remove empty tuples.
         */
        markSets = markSets.filter(marks => marks.length > 0);
        item.marks = markSets.map(marks => marks.pop()).filter((mark): mark is TextStyleElement | ShortGuid =>
          Boolean(mark)
        );
        mergedItems.push(item);
        break;
      default:
        mergedItems.push(item);
        break;
    }
    return mergedItems;
  }, []);
};

const mergeBlocksAndSpans: MergePortableTextItemsFunction = (itemsToMerge) =>
  itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
    const lastItem = mergedItems[mergedItems.length - 1];
    if (item._type === "span" && lastItem && lastItem._type === "block") {
      lastItem.children.push(item);
    } else {
      mergedItems.push(item);
    }
    return mergedItems;
  }, []);

const mergeTablesAndRows: MergePortableTextItemsFunction = (itemsToMerge) =>
  itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
    if (item._type === "row") {
      const tableBlock = mergedItems[mergedItems.length - 1] as PortableTextTable;
      tableBlock.rows.push(item);
    } else {
      mergedItems.push(item);
    }
    return mergedItems;
  }, []);

const mergeRowsAndCells: MergePortableTextItemsFunction = (itemsToMerge) =>
  itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
    if (item._type === "cell") {
      const tableRow = mergedItems[mergedItems.length - 1] as PortableTextTableRow;
      tableRow.cells.push(item);
    } else {
      mergedItems.push(item);
    }
    return mergedItems;
  }, []);

const composeAndMerge = compose(mergeTablesAndRows, mergeRowsAndCells, mergeBlocksAndSpans, mergeSpansAndMarks);

/**
 * Recursively traverses a tree structure, converting each `DomNode` into its corresponding `PortableTextItem` using an appropriate method from `transformMap`.
 * The output is a flattened array, specifically organized for later merging operations.
 *
 * @param {DomNode[]} nodes - The array of DomNodes to be flattened.
 * @param {number} [depth=0] - The current depth in the tree, used for list items.
 * @param {DomHtmlNode} [lastListElement] - The last processed list element, used for tracking nested lists.
 * @param {PortableTextListItemType} [listType] - The type of the current list being processed (bullet or number).
 * @returns {PortableTextItem[]} The flattened array of PortableTextItems.
 */
const flatten = (
  nodes: DomNode[],
  depth = 0,
  lastListElement?: DomHtmlNode,
  listType?: PortableTextListItemType,
): PortableTextItem[] =>
  nodes.flatMap((node: DomNode): PortableTextItem[] => {
    let currentListType = listType;

    if (isElement(node)) {
      if (node.tagName === "td") {
        return transformTableCell(node);
      }

      if (isListBlock(node)) {
        lastListElement = node;
        currentListType = isUnorderedListBlock(node) ? "bullet" : "number";
      }

      if (isListItem(node)) {
        // set depth to 1 for the first list item, increment for each nested list
        if (lastListElement && isListBlock(lastListElement)) {
          depth++;
        }
        // ensures depth remains the same until a nested listBlock is found
        lastListElement = undefined;
      }

      // Recursively flatten children and concatenate with the transformed node.
      const transformedNode = transformNode(node, depth, currentListType);
      const transformedChildren = flatten(node.children, depth, lastListElement, currentListType);

      return [...transformedNode, ...transformedChildren];
    }

    return [transformText(node)];
  });

const transformNode = (node: DomNode, depth: number, listType?: PortableTextListItemType): PortableTextItem[] =>
  isText(node) ? [transformText(node)] : transformElement(node, depth, listType);

const transformElement = (
  node: DomHtmlNode,
  depth: number,
  listType?: PortableTextListItemType,
): PortableTextItem[] => {
  const transformFunction = transformMap[node.tagName as ValidElement];

  return listType !== undefined
    ? (transformFunction as TransformListItemFunction)(node, depth, listType)
    : (transformFunction as TransformElementFunction)(node);
};

const transformImage: TransformElementFunction<FigureElementAttributes> = (node) => {
  const imageTag = node.children[0] as DomHtmlNode<ImgElementAttributes> | undefined;
  if (!imageTag || imageTag.tagName !== "img") {
    throw new Error("Expected the first child of <figure> to be an <img> element.");
  }

  const block = createImageBlock(
    randomUUID(),
    node.attributes["data-asset-id"],
    imageTag.attributes.src,
    imageTag.attributes.alt,
  );

  return [block];
};

const transformTableCell: TransformTableCellFunction = (node) => {
  const cellContent = flatten(node.children);
  const firstChild = node.children[0];
  const requiresNewBlock = !firstChild
    || isText(firstChild)
    || firstChild.tagName === lineBreakElement
    || markElements.includes(firstChild.tagName as MarkElement);

  /**
   * cell content may not start with <p> but can be directly text,
   * styled text (e.g. <strong>), anchor or a line break.
   * in such cases, a block has to be created manually first.
   */
  if (requiresNewBlock) {
    cellContent.unshift(createBlock(randomUUID()));
  }

  const mergedCellContent = composeAndMerge(cellContent);
  const tableCell = createTableCell(randomUUID(), mergedCellContent.length);
  tableCell.content = mergedCellContent as PortableTextBlock[];

  return [tableCell];
};

const transformItem: TransformElementFunction<ObjectElementAttributes> = (node) => {
  // data-codename reference is for DAPI, data-id for MAPI
  const itemReference: Reference = {
    _type: "reference",
    _ref: node.attributes["data-codename"] || node.attributes["data-id"],
  };

  /**
   * data-rel is only present in DAPI and acts as a differentiator
   * between component and linked item in rich text
   *
   * data-type is present in both DAPI and MAPI but differentiates
   * only in the latter
   */
  const modularContentType = node.attributes["data-rel"] ?? node.attributes["data-type"] as ModularContentType;

  return [createComponentBlock(randomUUID(), itemReference, modularContentType)];
};

const transformLink: TransformLinkFunction = (node) => {
  const linkId = randomUUID();
  const link = isItemLink(node)
    ? createItemLink(linkId, node.attributes["data-item-id"])
    : createExternalLink(linkId, node.attributes);

  const mark = createMark(randomUUID(), link._key, countChildTextNodes(node));

  return [link, mark];
};

const transformTable: TransformElementFunction = (node) => {
  const tableBody = node.children[0] as DomHtmlNode;
  if (tableBody.tagName !== "tbody") {
    throw new Error("Expected the first child to be a <tbody> element.");
  }

  const tableRow = tableBody.children[0] as DomHtmlNode;
  if (tableRow.tagName !== "tr") {
    throw new Error("Expected the first child of <tbody> to be a <tr> element.");
  }

  const numCols = tableRow.children.length;

  return [createTable(randomUUID(), numCols)];
};

const transformTableRow: TransformElementFunction = (): PortableTextTableRow[] => [createTableRow(randomUUID())];

const transformText: TransformTextFunction = (node) => createSpan(randomUUID(), [], node.content);

const transformBlock: TransformElementFunction = (
  node,
) => [createBlock(randomUUID(), undefined, node.tagName === "p" ? "normal" : node.tagName)];

const transformTextMark: TransformElementFunction = (
  node,
) => [createMark(randomUUID(), node.tagName as TextStyleElement, countChildTextNodes(node))];

const transformLineBreak: TransformElementFunction = () => [createSpan(randomUUID(), [], "\n")];

const transformListItem: TransformListItemFunction = (
  _,
  depth,
  listType,
) => [createListBlock(randomUUID(), depth, listType)];

const ignoreElement: TransformElementFunction = () => [];

const transformMap: Record<ValidElement, TransformFunction> = {
  ...Object.fromEntries(
    blockElements.map(tagName => [tagName, transformBlock]),
  ) as Record<BlockElement, TransformFunction>,
  ...Object.fromEntries(
    textStyleElements.map(tagName => [tagName, transformTextMark]),
  ) as Record<TextStyleElement, TransformFunction>,
  ...Object.fromEntries(
    ignoredElements.map(tagName => [tagName, ignoreElement]),
  ) as Record<IgnoredElement, TransformFunction>,
  a: transformLink,
  li: transformListItem,
  table: transformTable,
  tr: transformTableRow,
  td: transformTableCell,
  br: transformLineBreak,
  figure: transformImage,
  object: transformItem,
};

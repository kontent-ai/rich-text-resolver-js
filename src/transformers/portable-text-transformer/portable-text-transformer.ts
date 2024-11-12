import {
  DomHtmlNode,
  DomNode,
  DomTextNode,
  ImgElementAttributes,
  ObjectElementAttributes,
  ParseResult,
} from "../../parser/index.js";
import {
  BlockElement,
  IgnoredElement,
  PortableTextComponentOrItem,
  PortableTextExternalLink,
  PortableTextImage,
  PortableTextItem,
  PortableTextItemLink,
  PortableTextMark,
  PortableTextObject,
  PortableTextSpan,
  PortableTextStrictBlock,
  PortableTextStrictListItemBlock,
  PortableTextTable,
  PortableTextTableCell,
  PortableTextTableRow,
  Reference,
  TextStyleElement,
  ValidElement,
} from "../../transformers/index.js";
import {
  blockElements,
  createBlock,
  createComponentOrItemBlock,
  createExternalLink,
  createImageBlock,
  createItemLink,
  createListBlock,
  createSpan,
  createTable,
  createTableCell,
  createTableRow,
  ignoredElements,
  isElement,
  isExternalLink,
  isItemLink,
  isListBlock,
  isText,
  isValidElement,
  randomUUID,
  textStyleElements,
  TransformNodeFunction,
  traverseAndTransformNodes,
} from "../../utils/index.js";

type ListContext = {
  depth: number;
  type: "number" | "bullet" | "unknown";
};

type NodeToPortableText<T extends DomNode> = TransformNodeFunction<T, ListContext, PortableTextItem>;

const categorizeItems = (items: PortableTextItem[]) =>
  items.reduce(
    (acc, item) => {
      const categoryMap: Record<PortableTextItem["_type"], PortableTextItem[]> = {
        link: acc.links,
        contentItemLink: acc.contentItemLinks,
        span: acc.spans,
        mark: acc.marks,
        cell: acc.cells,
        row: acc.rows,
        image: acc.images,
        componentOrItem: acc.componentsOrItems,
        table: acc.tables,
        block: acc.blocks,
        reference: acc.references,
      };

      if (item._type === "block") {
        (item.listItem ? acc.listBlocks : acc.blocks).push(item);
      } else {
        categoryMap[item._type]?.push(item);
      }

      return acc;
    },
    {
      links: [] as PortableTextExternalLink[],
      contentItemLinks: [] as PortableTextItemLink[],
      spans: [] as PortableTextSpan[],
      listBlocks: [] as PortableTextStrictListItemBlock[],
      blocks: [] as PortableTextStrictBlock[],
      marks: [] as PortableTextMark[],
      cells: [] as PortableTextTableCell[],
      rows: [] as PortableTextTableRow[],
      images: [] as PortableTextImage[],
      componentsOrItems: [] as PortableTextComponentOrItem[],
      tables: [] as PortableTextTable[],
      references: [] as Reference[],
    },
  );

const updateListContext = (node: DomNode, context: ListContext): ListContext =>
  (isElement(node) && isListBlock(node))
    ? { depth: context.depth + 1, type: node.tagName === "ol" ? "number" : "bullet" }
    : context;

const transformLineBreak: NodeToPortableText<DomHtmlNode> = () => [createSpan(randomUUID(), [], "\n")];

const transformListItem: NodeToPortableText<DomHtmlNode> = (_, processedItems, listContext) => {
  const {
    links,
    contentItemLinks,
    spans,
    listBlocks,
  } = categorizeItems(processedItems);

  return [
    createListBlock(
      randomUUID(),
      listContext?.depth,
      listContext?.type,
      [...links, ...contentItemLinks],
      "normal",
      spans,
    ),
    // any existing listBlocks need to be returned as well, because of nested lists
    ...listBlocks,
  ];
};

const transformBlockElement: NodeToPortableText<DomHtmlNode> = (node, processedItems) => {
  const {
    spans,
    links,
    contentItemLinks,
  } = categorizeItems(processedItems);

  return [
    createBlock(randomUUID(), [...links, ...contentItemLinks], node.tagName === "p" ? "normal" : node.tagName, spans),
  ];
};

const transformMarkElement: NodeToPortableText<DomHtmlNode> = (node, processedItems) => {
  const {
    links,
    contentItemLinks,
    spans,
  } = categorizeItems(processedItems);

  const key = randomUUID();
  const mark = isExternalLink(node)
    ? (links.push(createExternalLink(key, node.attributes)), key)
    : isItemLink(node)
    ? (contentItemLinks.push(createItemLink(key, node.attributes["data-item-id"])), key)
    : node.tagName;

  const updatedSpans = spans.map(
    s => ({ ...s, marks: [...(s.marks ?? []), mark] } as PortableTextSpan),
  );

  return [...updatedSpans, ...links, ...contentItemLinks];
};

const transformImage: NodeToPortableText<DomHtmlNode<ImgElementAttributes>> = (node) => [
  createImageBlock(
    randomUUID(),
    node.attributes["data-asset-id"],
    node.attributes["src"],
    node.attributes["alt"],
  ),
];

const transformLinkedItemOrComponent: NodeToPortableText<DomHtmlNode<ObjectElementAttributes>> = (node) => {
  const itemComponentReference: Reference = {
    _type: "reference",
    _ref: node.attributes["data-codename"] || node.attributes["data-id"],
  };
  const modularContentType = node.attributes["data-rel"] ?? node.attributes["data-type"];

  return [createComponentOrItemBlock(randomUUID(), itemComponentReference, modularContentType)];
};

const transformTableCell: NodeToPortableText<DomHtmlNode> = (_, processedItems) => {
  const {
    links,
    contentItemLinks,
    spans,
  } = categorizeItems(processedItems);

  if (!spans.length) {
    return [createTableCell(randomUUID(), processedItems)];
  }
  // in case there are orphaned spans (can happen as table cell content can be directly text, without any enclosing block tag such as <p>)
  const block = createBlock(randomUUID(), [...links, ...contentItemLinks], "normal", spans);

  return [createTableCell(randomUUID(), [block])];
};

const transformTableRow: NodeToPortableText<DomHtmlNode> = (_, processedItems) => {
  const { cells } = categorizeItems(processedItems);

  return [createTableRow(randomUUID(), cells)];
};

const transformTable: NodeToPortableText<DomHtmlNode> = (_, processedItems) => {
  const { rows } = categorizeItems(processedItems);

  return [createTable(randomUUID(), rows)];
};

const ignoreElement: NodeToPortableText<DomHtmlNode> = (_, processedItems) => processedItems;

const transformElement: NodeToPortableText<DomHtmlNode> = (node, processedItems, listContext) =>
  transformMap[node.tagName as ValidElement](node, processedItems, listContext);

const transformText: NodeToPortableText<DomTextNode> = (node) => [createSpan(randomUUID(), [], node.content)];

const toPortableText: NodeToPortableText<DomNode> = (node, processedItems, listContext) =>
  isText(node)
    ? transformText(node, processedItems)
    : isValidElement(node)
    ? transformElement(node, processedItems, listContext)
    : [];

/**
 * Transforms a parsed tree into an array of Portable Text Blocks.
 *
 * @param {ParseResult} parsedTree The parsed tree structure representing the rich text content.
 * @returns {PortableTextObject[]} An array of Portable Text Blocks representing the structured content.
 */
export const transformToPortableText = (
  parsedTree: ParseResult,
): PortableTextObject[] =>
  traverseAndTransformNodes(
    parsedTree.children,
    toPortableText,
    { depth: 0, type: "unknown" }, // initialization of list transformation context
    updateListContext,
  ) as PortableTextObject[]; // TODO: examine why as PortableTextObject[] was required, update jsdoc

const transformMap: Record<ValidElement, NodeToPortableText<DomHtmlNode<any>>> = {
  ...(Object.fromEntries(
    blockElements.map((tagName) => [tagName, transformBlockElement]),
  ) as Record<BlockElement, NodeToPortableText<DomHtmlNode>>),
  ...(Object.fromEntries(
    textStyleElements.map((tagName) => [tagName, transformMarkElement]),
  ) as Record<TextStyleElement, NodeToPortableText<DomHtmlNode>>),
  ...(Object.fromEntries(
    ignoredElements.map((tagName) => [tagName, ignoreElement]),
  ) as Record<IgnoredElement, NodeToPortableText<DomHtmlNode>>),
  a: transformMarkElement,
  li: transformListItem,
  table: transformTable,
  tr: transformTableRow,
  td: transformTableCell,
  br: transformLineBreak,
  img: transformImage,
  object: transformLinkedItemOrComponent,
};

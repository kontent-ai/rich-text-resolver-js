import {
  DomHtmlNode,
  DomNode,
  DomTextNode,
  FigureElementAttributes,
  ImgElementAttributes,
  ItemLinkElementAttributes,
  ObjectElementAttributes,
} from "../index.js";

export const isOrderedListBlock = (node: DomHtmlNode): boolean => node.tagName === "ol";

export const isUnorderedListBlock = (node: DomHtmlNode): boolean => node.tagName === "ul";

export const isListBlock = (node: DomHtmlNode): boolean => isUnorderedListBlock(node) || isOrderedListBlock(node);

export const isListItem = (node: DomHtmlNode): boolean => node.tagName === "li";

export const isExternalLink = (node: DomHtmlNode): boolean => isAnchor(node) && !node.attributes["data-item-id"];

export const isAnchor = (node: DomHtmlNode): boolean => node.tagName === "a";

export const isTableCell = (node: DomHtmlNode): boolean => isElement(node) && node.tagName === "td";

export const isLineBreak = (node: DomHtmlNode): boolean => isElement(node) && node.tagName === "br";

/**
 * Returns `true` for text nodes and type guards the node as `DomTextNode`.
 */
export const isText = (node: DomNode): node is DomTextNode => node.type === "text";

/**
 * Returns `true` for HTML nodes and type guards the node as `DomHtmlNode`.
 */
export const isElement = (node: DomNode): node is DomHtmlNode => node.type === "tag";

/**
 * Returns `true` if the node is a linked item node (`<object></object>`) and narrows type guard.
 */
export const isLinkedItem = (node: DomNode): node is DomHtmlNode<ObjectElementAttributes> =>
  isElement(node)
  && node.tagName === "object"
  && node.attributes["type"] === "application/kenticocloud";

/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`) and narrows type guard.
 */
export const isImage = (node: DomNode): node is DomHtmlNode<FigureElementAttributes> =>
  isElement(node)
  && node.tagName === "figure"
  && node.attributes["data-asset-id"] !== undefined;

/**
 * Returns `true` if the node is a link to a content item and narrows type guard.
 */
export const isItemLink = (node: DomHtmlNode): node is DomHtmlNode<ItemLinkElementAttributes> =>
  isAnchor(node) && node.attributes["data-item-id"] !== undefined;

/**
 * Returns `true` if the node is a Kontent.ai rich text `img` node and narrows type guard.
 */
export const isNestedImg = (node?: DomNode): node is DomHtmlNode<ImgElementAttributes> =>
  node !== undefined
  && isElement(node)
  && node.tagName === "img"
  && node.attributes["data-asset-id"] !== undefined;

/**
 * Recursively counts the number of text nodes and line breaks within a given DOM node and all of its descendants.
 *
 * @param node - Node to start counting from
 * @returns The total number of text nodes found within the provided node and its children
 */
export const countChildTextNodesAndLineBreaks = (node: DomNode): number =>
  node.type === "text" || node.tagName === "br"
    ? 1
    : node.children.reduce((count, child) => count + countChildTextNodesAndLineBreaks(child), 0);

export const throwError = (msg: string) => {
  throw new Error(msg);
};

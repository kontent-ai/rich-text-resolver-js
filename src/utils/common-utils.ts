import { DomHtmlNode, DomNode, DomTextNode } from "../parser/parser-models.js";

export const isOrderedListBlock = (node: DomHtmlNode): boolean =>
    node.tagName === 'ol';

export const isUnorderedListBlock = (node: DomHtmlNode): boolean =>
    node.tagName === 'ul';

export const isListBlock = (node: DomHtmlNode): boolean =>
    isUnorderedListBlock(node) || isOrderedListBlock(node)

export const isListItem = (node: DomHtmlNode): boolean =>
    node.tagName === 'li';

export const isExternalLink = (node: DomHtmlNode): boolean =>
    isAnchor(node) && !node.attributes['data-item-id'];

export const isAnchor = (node: DomHtmlNode): boolean =>
    node.tagName === 'a';

/**
 * Returns `true` for text nodes and type guards the node as `DomTextNode`.
 */ 
export const isText = (node: DomNode): node is DomTextNode =>
    node.type === 'text';

/**
 * Returns `true` for HTML nodes and type guards the node as `DomHtmlNode`.
 */ 
export const isElement = (node: DomNode): node is DomHtmlNode =>
    node.type === 'tag';

/**
 * Returns `true` if the node is a linked item node (`<object></object>`).
 */ 
export const isLinkedItem = (node: DomNode): boolean =>
    isElement(node) && 
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';
/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`).
 */ 
export const isImage = (node: DomNode): boolean =>
    isElement(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;

/**
 * Returns `true` if the node is a link to a content item.
 */
export const isItemLink = (node: DomHtmlNode): boolean =>
    isAnchor(node) && !isExternalLink(node);
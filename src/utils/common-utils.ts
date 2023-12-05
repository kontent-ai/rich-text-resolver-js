import { IDomHtmlNode, IDomNode, IDomTextNode } from "../index.js";

export const isOrderedListBlock = (node: IDomHtmlNode): boolean =>
    node.tagName === 'ol';

export const isUnorderedListBlock = (node: IDomHtmlNode): boolean =>
    node.tagName === 'ul';

export const isListBlock = (node: IDomHtmlNode): boolean =>
    isUnorderedListBlock(node) || isOrderedListBlock(node)

export const isListItem = (node: IDomHtmlNode): boolean =>
    node.tagName === 'li';

export const isExternalLink = (node: IDomHtmlNode): boolean =>
    isAnchor(node) && !node.attributes['data-item-id'];

export const isAnchor = (node: IDomHtmlNode): boolean =>
    node.tagName === 'a';

/**
 * Returns `true` for text nodes and type guards the node as `IDomTextNode`.
 */ 
export const isText = (node: IDomNode): node is IDomTextNode =>
    node.type === 'text';

/**
 * Returns `true` for HTML nodes and type guards the node as `IDomHtmlNode`.
 */ 
export const isElement = (node: IDomNode): node is IDomHtmlNode =>
    node.type === 'tag';

/**
 * Returns `true` if the node is a linked item node (`<object></object>`).
 */ 
export const isLinkedItem = (node: IDomNode): boolean =>
    isElement(node) && 
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';
/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`).
 */ 
export const isImage = (node: IDomNode): boolean =>
    isElement(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;

/**
 * Returns `true` if the node is a link to a content item.
 */
export const isItemLink = (node: IDomHtmlNode): boolean =>
    isAnchor(node) && !isExternalLink(node);
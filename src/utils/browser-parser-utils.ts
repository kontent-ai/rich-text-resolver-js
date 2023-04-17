import { IDomHtmlNode, IDomNode, IDomTextNode } from "../parser/parser-models"

export enum NodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    DOCUMENT_NODE = 9
}

export const convertDomNodeAttributes = (domNodeAttributes: NamedNodeMap): Record<string,string> => {
    const convertedAttributes: Record<string, string> = {};

    for (const attr of domNodeAttributes) {
        convertedAttributes[attr.name] = attr.value;
    }

    return convertedAttributes;
}

export const isRootNode = (domNode: Node): domNode is Document =>
    domNode.nodeType === NodeType.DOCUMENT_NODE

export const isTextNode = (domNode: Node): domNode is Text =>
    domNode.nodeType === NodeType.TEXT_NODE

export const isElementNode = (domNode: Node): domNode is Element =>
    domNode.nodeType === NodeType.ELEMENT_NODE

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

export type OmitKey<T, K> = Pick<T, Exclude<keyof T, K>>;

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


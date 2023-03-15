import { NodeType, TextNode, HTMLElement, Node } from "node-html-parser"

export const isRootNode = (domNode: Node): domNode is HTMLElement =>
domNode.nodeType === NodeType.ELEMENT_NODE && !domNode.parentNode

export const isTextNode = (domNode: Node): domNode is TextNode =>
    domNode.nodeType === NodeType.TEXT_NODE

export const isElementNode = (domNode: Node): domNode is HTMLElement =>
    domNode.nodeType === NodeType.ELEMENT_NODE

export const isStyleBlock = (domNode: HTMLElement): boolean =>
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(domNode.tagName.toLowerCase())

export const isTextMark = (domNode: HTMLElement): boolean =>
    ['em', 'strong', 'superscript', 'subscript'].includes(domNode.tagName.toLowerCase())

export const isListBlock = (domNode: HTMLElement): boolean =>
    ['ol', 'ul'].includes(domNode.tagName.toLowerCase())

export const isListItem = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'li';

export const isBlock = (domNode: HTMLElement): boolean =>
    isStyleBlock(domNode) || isListBlock(domNode) || domNode.tagName.toLowerCase() === 'p'

export const isExternalLink = (domNode: HTMLElement): boolean =>
    domNode.tagName.toLowerCase() === 'a' && !domNode.attributes['data-item-id'] // is this correct?

export const isInternalLink = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'a' && !isExternalLink(domNode)

export const isLineBreak = (domNode: HTMLElement): boolean =>
    domNode.tagName.toLowerCase() === 'br'

export const isFigure = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'figure'

export const isImage = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'img'

export const isLinkedItem = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'object' && domNode.attributes["type"] === "application/kenticocloud"

export const isIgnoredElement = (domNode: HTMLElement): boolean =>
    ['tbody','tr'].includes(domNode.rawTagName);

export const isTable = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'table'

export const isTableCell = (domNode: HTMLElement): boolean =>
    domNode.rawTagName === 'td'
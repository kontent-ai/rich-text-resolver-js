import { NodeType, TextNode, HTMLElement, Node } from "node-html-parser"

export const isRootNode = (domNode: Node): domNode is HTMLElement =>
domNode.nodeType === NodeType.ELEMENT_NODE && !domNode.parentNode

export const isTextNode = (domNode: Node): domNode is TextNode =>
    domNode.nodeType === NodeType.TEXT_NODE

export const isElementNode = (domNode: Node): domNode is HTMLElement =>
    domNode.nodeType === NodeType.ELEMENT_NODE
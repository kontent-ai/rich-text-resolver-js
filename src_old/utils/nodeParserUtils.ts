import { Node, HTMLElement, NodeType, TextNode} from "node-html-parser";

export const isTextNode = (domNode: Node): domNode is TextNode =>
    domNode.nodeType === NodeType.TEXT_NODE

export const isElementNode = (domNode: Node): domNode is HTMLElement =>
    domNode.nodeType === NodeType.ELEMENT_NODE

export const isRootNode = (domNode: Node): domNode is HTMLElement =>
    isElementNode(domNode) && domNode.parentNode == undefined
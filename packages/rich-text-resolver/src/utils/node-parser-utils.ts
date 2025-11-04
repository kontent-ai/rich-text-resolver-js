import { type HTMLElement, type Node, NodeType, type TextNode } from "node-html-parser";

export const isTextNode = (domNode: Node): domNode is TextNode =>
  domNode.nodeType === NodeType.TEXT_NODE;

export const isElementNode = (domNode: Node): domNode is HTMLElement =>
  domNode.nodeType === NodeType.ELEMENT_NODE;

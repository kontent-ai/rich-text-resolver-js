import { NodeType } from "node-html-parser";
export const isRootNode = (domNode) => domNode.nodeType === NodeType.ELEMENT_NODE && !domNode.parentNode;
export const isTextNode = (domNode) => domNode.nodeType === NodeType.TEXT_NODE;
export const isElementNode = (domNode) => domNode.nodeType === NodeType.ELEMENT_NODE;

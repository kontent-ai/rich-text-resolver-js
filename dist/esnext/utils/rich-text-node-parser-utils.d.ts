import { TextNode, HTMLElement, Node } from "node-html-parser";
export declare const isRootNode: (domNode: Node) => domNode is HTMLElement;
export declare const isTextNode: (domNode: Node) => domNode is TextNode;
export declare const isElementNode: (domNode: Node) => domNode is HTMLElement;

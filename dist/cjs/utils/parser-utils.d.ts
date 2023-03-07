import { IDomHtmlNode, IDomNode, IDomTextNode } from "../parser/parser-models";
export declare enum NodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    DOCUMENT_NODE = 9
}
export declare const convertDomNodeAttributes: (domNodeAttributes: NamedNodeMap) => Record<string, string>;
export declare const isRootNode: (domNode: Node) => domNode is Document;
export declare const isTextNode: (domNode: Node) => domNode is Text;
export declare const isElementNode: (domNode: Node) => domNode is Element;
/**
 * Returns `true` for text nodes and type guards the node as `IDomTextNode`.
 */
export declare const isText: (node: IDomNode) => node is IDomTextNode;
/**
 * Returns `true` for HTML nodes and type guards the node as `IDomHtmlNode`.
 */
export declare const isElement: (node: IDomNode) => node is IDomHtmlNode;
/**
 * Returns `true` if the node is a linked item node (`<object></object>`).
 */
export declare const isLinkedItem: (node: IDomNode) => boolean;
/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`).
 */
export declare const isImage: (node: IDomNode) => boolean;
/**
 * Returns `true` if the node is a link to a content item.
 */
export declare const isItemLink: (node: IDomNode) => boolean;
/**
 * Returns `true` if the node represents an unpaired element (`br, img, hr, meta`)
 */
export declare const isUnPairedElement: (node: IDomNode) => boolean;

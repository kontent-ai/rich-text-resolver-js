import { IDomNode } from "../IDomNode"

export type IParseResult = {
    children: IDomNode[]
}

export enum NodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    DOCUMENT_NODE = 9
}

export const convertDomNodeAttributes = (domNodeAttributes: NamedNodeMap): Record<string,string> => {
    let convertedAttributes: Record<string, string> = {};

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
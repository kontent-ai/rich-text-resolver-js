import { IDomHtmlNode, IDomNode, IDomTextNode, RichTextInput } from "../parser/parser-models"

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

export const isText = (node: IDomNode): node is IDomTextNode =>
    node.type === 'text';

export const isElement = (node: IDomNode): node is IDomHtmlNode =>
    node.type === 'tag';

export const isLinkedItem = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) && 
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';

export const isImage = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;

export const isItemLink = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) &&
    node.tagName === 'a' &&
    node.attributes['data-item-id'] ? true : false;

export const isUnPairedElement = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) &&
    ['br', 'img', 'hr', 'meta'].includes(node.tagName);

export const getElementInputFromSdk = (element: SDKRichTextElement): RichTextInput => {
    return {
        ...element,
        images: Object.fromEntries(
            element.images.map(image => [image.imageId, image])
        ),
        links: Object.fromEntries(
            element.links.map(link => [link.linkId, link])
        ),
        modular_content: element.linkedItems.map(item => item.system.codename),
        linked_items: Object.fromEntries(
            element.linkedItems.map(item => [item.system.codename, item])
        )
    }
}

interface SDKRichTextElement {
    value: string,
    links: {
        linkId: string,
        codename: string,
        type: string,
        urlSlug: string
    }[],
    images: {
        imageId: string,
        url: string,
        description: string | null,
        width: number | null,
        height: number | null
    }[],
    linkedItems: any[]
}

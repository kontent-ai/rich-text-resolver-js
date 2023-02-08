import { IDomHtmlNode, IDomNode, IDomTextNode } from "../parser/parser-models"
import { ILinkFunction, RichTextInput } from "../resolver/resolver-models";

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
        value: element.value,
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

interface SDKRichTextElement { // TODO use typescript magic to simplify this?
    value: string,
    links: [{
        linkId: string,
        codename: string,
        type: string,
        urlSlug: string
    }],
    images: [{
        imageId: string,
        url: string,
        description: string,
        width: number | null,
        height: number | null
    }],
    linkedItems: [any]
}

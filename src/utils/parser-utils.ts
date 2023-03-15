import { IDomHtmlNode, IDomNode, IDomTextNode, IPortableTextComponent, IPortableTextImage, IPortableTextListBlock, IPortableTextMarkDef, IPortableTextParagraph, IPortableTextSpan, IPortableTextTable, IReference } from "../parser/parser-models"

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
/**
 * Returns `true` for text nodes and type guards the node as `IDomTextNode`.
 */ 
export const isText = (node: IDomNode): node is IDomTextNode =>
    node.type === 'text';
/**
 * Returns `true` for HTML nodes and type guards the node as `IDomHtmlNode`.
 */ 
export const isElement = (node: IDomNode): node is IDomHtmlNode =>
    node.type === 'tag';
/**
 * Returns `true` if the node is a linked item node (`<object></object>`).
 */ 
export const isLinkedItem = (node: IDomNode): boolean =>
    isElement(node) && 
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';
/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`).
 */ 
export const isImage = (node: IDomNode): boolean =>
    isElement(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;

/**
 * Returns `true` if the node is a link to a content item.
 */
export const isItemLink = (node: IDomNode): boolean =>
    isElement(node) &&
    node.tagName === 'a' &&
    node.attributes['data-item-id'] ? true : false;

/**
 * Returns `true` if the node represents an unpaired element (`br, img, hr, meta`)
 */
export const isUnPairedElement = (node: IDomNode): boolean =>
    isElement(node) &&
    ['br', 'img', 'hr', 'meta'].includes(node.tagName);


export const createSpan = (
        guid: string,
        marks?: string[],
        text?: string
    ): IPortableTextSpan => {
    return {
        _type: 'span',
        _key: guid,
        marks: marks || [],
        text: text || ''
    }
}

export const createBlock = (
        guid: string, 
        markDefs?: IPortableTextMarkDef[], 
        style?: string, 
        children?: IPortableTextSpan[]
    ): IPortableTextParagraph => {
    return {
        _type: 'block',
        _key: guid,
        markDefs: markDefs || [],
        style: style || 'normal',
        children: children || []
    }
}

export const createListBlock = (
        guid: string,
        level: number,
        listItem: "number" | "bullet",
        markDefs?: IPortableTextMarkDef[],
        style?: string,
        children?: IPortableTextSpan[],

    ): IPortableTextListBlock => {
    return {
        _type: 'block',
        _key: guid,
        markDefs: markDefs || [],
        level: level,
        listItem: listItem,
        style: style || 'normal',
        children: children || []
    }
}

export const createImageBlock = (
        guid: string
    ): IPortableTextImage => {
    return {
        _type: 'image',
        _key: guid,
        asset: {
            _type: 'reference',
            _ref: '',
            url: ''
        }
    }
}

export const createTableBlock = (guid: string, rows: number, columns: number): IPortableTextTable => {
    return {
        _type: 'table',
        _key: 'guid',
        rows: rows,
        columns: columns,
        childBlocks: []
    }
}

export enum ProcessedUnit {
    None,
    Block,
    Span
}

export const createComponentBlock = (guid: string, reference: IReference): IPortableTextComponent => {
    return {
        _type: 'component',
        _key: guid,
        component: reference
    }
}

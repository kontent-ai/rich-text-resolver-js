export type IDomNode = IDomHtmlNode | IDomTextNode;

export interface IDomTextNode {
    type: 'text'
    content: string
}

export interface IDomHtmlNode {
    type: 'tag',
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[]
}
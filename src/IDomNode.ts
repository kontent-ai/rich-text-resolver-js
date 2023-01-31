export interface IDomNode {
    type: 'text' | 'tag'
}

export interface IDomTextNode extends IDomNode {
    content: string
}

export interface IDomHtmlNode extends IDomNode{
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[]
}
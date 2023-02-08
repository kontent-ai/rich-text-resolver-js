export type IDomNode = IDomHtmlNode | IDomTextNode;

export type IParseResult = {
    children: IDomNode[]
}

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

export interface IParser {
    parse(value: string): {
        children: IDomNode[]
    }
}

export interface IParserEngine {
    parse(html: string): any;
}
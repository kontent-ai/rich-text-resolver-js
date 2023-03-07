export type IDomNode = IDomHtmlNode | IDomTextNode;

export interface IDomTextNode {
    type: 'text',
    content: string
}

export interface IDomHtmlNode {
    type: 'tag',
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[]
}

export interface IParserEngine {
    parse(html: string): any;
}

export interface IOutputResult {
    children: IDomNode[]
}

export interface IRichTextParser<TInput, TOutput> {
    parse(input: TInput): TOutput
}

/// portable text section

export interface IPortableTextItem {
    _type: string,
    _key: string
}

export interface IPortableTextBlock extends IPortableTextItem {
    _type: 'block',
    markDefs: IPortableTextMarkDef[],
    style: string,
    children: IPortableTextSpan[]

}

export interface IPortableTextMarkDef extends IPortableTextItem {

}

export interface IPortableTextLink extends IPortableTextMarkDef {
    _type: 'link',
    href: string,
    target: string
}

export interface IPortableTextListBlock extends IPortableTextBlock {
    listItem: "bullet" | "number",
    level: number
}

export interface IPortableTextSpan extends IPortableTextItem {
    _type: 'span',
    marks: string[],
    text: string
}

export interface IPortableText {
    children: IPortableTextItem[]
}
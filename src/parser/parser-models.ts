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

export interface IPortableTextParagraph extends IPortableTextItem {
    _type: 'block',
    markDefs: IPortableTextMarkDef[],
    style: string,
    children: IPortableTextSpan[]
}

export type IPortableTextMarkDef = IPortableTextLink | IPortableTextInternalLink; // add more markdefs

export interface IPortableTextLink extends IPortableTextItem {
    _type: 'link',
    href: string,
    target: string,
    title: string,
    rel: string
}

export interface IPortableTextInternalLink extends IPortableTextItem {
    _type: 'internalLink',
    reference: IReference
}

export interface IPortableTextListBlock extends IPortableTextItem {
    listItem: "number" | "bullet",
    level: number,
    style: string,
    markDefs: IPortableTextMarkDef[],
    children: IPortableTextSpan[],
}

export type IPortableTextBlock = IPortableTextListBlock | IPortableTextParagraph | IPortableTextImage | IPortableTextTable | IPortableTextComponent;

export interface IPortableTextSpan extends IPortableTextItem {
    _type: 'span',
    marks: string[],
    text: string
}


export interface IBlockBuffer {
    element?: IPortableTextBlock,
    marks: string[],
    finishedBlocks: IPortableTextBlock[],
    listLevel: number,
    listType?: 'number' | 'bullet'
}

export interface IPortableTextImage extends IPortableTextItem {
    _type: 'image',
    asset: IAssetReference
}

export interface IReference {
    _type: 'reference',
    _ref: string
}

export interface IAssetReference extends IReference {
    url: string
}

export interface IPortableTextTable extends IPortableTextItem {
    _type: 'table',
    _key: string,
    rows: number,
    columns: number,
    childBlocks: IPortableTextItem[]
}

export interface IPortableTextComponent extends IPortableTextItem {
    _type: 'component',
    component: IReference
}
export type IDomNode = IDomHtmlNode | IDomTextNode;

export interface IDomTextNode {
    type: 'text',
    content: string
}

export interface IDomHtmlNode {
    type: 'tag',
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[],
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

export interface IPortableTextParagraph  {
    _type: 'block',
    _key: string,
    markDefs: IPortableTextMarkDef[],
    style: string,
    children: IPortableTextSpan[]
}

export type ListType = 'number' | 'bullet';

export type IPortableTextMarkDef = IPortableTextExternalLink | IPortableTextInternalLink; // add more markdefs

export interface IPortableTextExternalLink  {
    _key: string;
    _type: 'link'
}

export interface IPortableTextInternalLink  {
    _key: string,
    _type: 'internalLink',
    reference: IReference
}

export interface IPortableTextListBlock  {
    _key: string,
    _type: "block",
    listItem: "number" | "bullet",
    level: number,
    style: string,
    markDefs: IPortableTextMarkDef[],
    children: IPortableTextSpan[],
}

export type IPortableTextItem = IPortableTextBlock | IPortableTextSpan | IPortableTextInternalLink | IPortableTextExternalLink;

export type IPortableTextBlock = IPortableTextListBlock | IPortableTextParagraph | IPortableTextImage | IPortableTextComponent | IPortableTextMark | IPortableTextTable | IPortableTextTableCell | IPortableTextTableRow;

export interface IPortableTextSpan  {
    _key: string,
    _type: 'span',
    marks: string[],
    text: string
}

export interface IBlockBuffer {
    element?: IPortableTextBlock,
    marks: string[],
    finishedBlocks: IPortableTextBlock[],
    listLevel: number,
    listType?: ListType
}

export interface IPortableTextImage {
    _key: string,
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

export interface IPortableTextTable {
    _type: 'table',
    _key: string,
    numColumns: number,
    rows: IPortableTextTableRow[],
}

export interface IPortableTextTableRow {
    _key: string,
    _type: 'row',
    cells: IPortableTextTableCell[]
}

export interface IPortableTextTableCell {
    _key: string,
    _type: 'cell',
    childBlocksCount: number,
    content: IPortableTextBlock[]
}

export interface IPortableTextComponent {
    _key: string,
    _type: 'component',
    component: IReference
}

export interface IPortableTextStyleMark  {
    _key: string,
    _type: 'mark',
    value: string
}

export interface IPortableTextLinkMark {
    _key: string,
    _type: 'linkMark',
    value: string
}

export type IPortableTextMark = IPortableTextLinkMark | IPortableTextStyleMark

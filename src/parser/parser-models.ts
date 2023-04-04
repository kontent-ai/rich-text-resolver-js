import { OmitKey } from "../utils";

export type IPortableTextItem = IPortableTextBlock | IPortableTextSpan | IPortableTextInternalLink | IPortableTextExternalLink;
export type IPortableTextMark = IPortableTextLinkMark | IPortableTextStyleMark;
export type IPortableTextBlock = IPortableTextListBlock | IPortableTextParagraph | IPortableTextImage | IPortableTextComponent | IPortableTextMark | IPortableTextTable | IPortableTextTableCell | IPortableTextTableRow;
export type IPortableTextMarkDef = IPortableTextExternalLink | IPortableTextInternalLink;
export type IDomNode = IDomHtmlNode | IDomTextNode;
export type ListType = 'number' | 'bullet';
export type LinkAttributes = OmitKey<Record<string, string>, 'markDefs'>;
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

export interface IOutputResult {
    children: IDomNode[]
}

export interface IReference {
    _type: 'reference',
    _ref: string
}

export interface IAssetReference extends IReference {
    url: string
}

export interface IPortableTextBaseItem {
    _key: string,
    _type: string
}

export interface IPortableTextParagraph extends IPortableTextBaseItem  {
    _type: 'block',
    markDefs: IPortableTextMarkDef[],
    style: string,
    children: IPortableTextSpan[]
}

export interface IPortableTextExternalLink extends IPortableTextBaseItem {
    _type: 'link';
}

export interface IPortableTextInternalLink extends IPortableTextBaseItem {
    _type: 'internalLink',
    reference: IReference
}

export interface IPortableTextListBlock extends IPortableTextBaseItem {
    _type: "block",
    listItem: "number" | "bullet",
    level: number,
    style: string,
    markDefs: IPortableTextMarkDef[],
    children: IPortableTextSpan[],
}

export interface IPortableTextImage extends IPortableTextBaseItem {
    _type: 'image',
    asset: IAssetReference
}

export interface IPortableTextSpan extends IPortableTextBaseItem {
    _type: 'span',
    marks: string[],
    text: string
}

export interface IPortableTextTable extends IPortableTextBaseItem {
    _type: 'table',
    numColumns: number,
    rows: IPortableTextTableRow[],
}

export interface IPortableTextTableRow extends IPortableTextBaseItem {
    _type: 'row',
    cells: IPortableTextTableCell[]
}

export interface IPortableTextTableCell extends IPortableTextBaseItem {
    _type: 'cell',
    childBlocksCount: number,
    content: IPortableTextBlock[]
}

export interface IPortableTextComponent extends IPortableTextBaseItem {
    _type: 'component',
    component: IReference
}

export interface IPortableTextStyleMark extends IPortableTextBaseItem  {
    _type: 'mark',
    value: string
}

export interface IPortableTextLinkMark extends IPortableTextBaseItem {
    _type: 'linkMark',
    value: string
}
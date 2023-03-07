export declare type IDomNode = IDomHtmlNode | IDomTextNode;
export interface IDomTextNode {
    type: 'text';
    content: string;
}
export interface IDomHtmlNode {
    type: 'tag';
    tagName: string;
    attributes: Record<string, string>;
    children: IDomNode[];
}
export interface IParserEngine {
    parse(html: string): any;
}
export interface IOutputResult {
    children: IDomNode[];
}
export interface IRichTextParser<TInput, TOutput> {
    parse(input: TInput): TOutput;
}

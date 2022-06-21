import { Elements } from "@kentico/kontent-delivery";

export interface IHtmlNode {
    tagName: string,
    attributes: {[key: string]: string},
    textContent: string,
    children: IHtmlNode[]
}

export interface IRichTextToJsonTransformer {
    transform(dummyRichText: Elements.RichTextElement): IHtmlNode[];
};
import { Elements } from "@kentico/kontent-delivery";
import { HTMLElement } from 'node-html-parser';

export interface IHtmlNode {
    tagName: string,
    attributes: Record<string, string>,
    textContent: string,
    children: IHtmlNode[]
}

export interface IRichTextToJsonTransformer {
    transform(dummyRichText: Elements.RichTextElement): IHtmlNode[];
    remapNode(parsedHtml: HTMLElement): IHtmlNode[];
};
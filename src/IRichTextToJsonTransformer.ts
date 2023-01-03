import { Elements } from "@kontent-ai/delivery-sdk";
import { HTMLElement } from 'node-html-parser';

export interface IHtmlNode {
    tagName: string,
    attributes: Record<string, string>,
    innerContent: string,
    children: IHtmlNode[]
}

export interface IRichTextToJsonTransformer {
    transform(dummyRichText: Elements.RichTextElement): IHtmlNode[];
    remapNode(parsedHtml: HTMLElement): IHtmlNode[];
};
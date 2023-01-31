import { Elements } from "@kontent-ai/delivery-sdk";
import { HTMLElement as NodeHTMLElement } from "node-html-parser";

export interface IHtmlNode {
    tagName: string,
    attributes: Record<string, string>,
    innerContent: string,
    children: IHtmlNode[]
}

export interface IParserNode {
    type: string
}

export interface IParserHtmlNode extends IParserNode {
    name: string;
    attributes: Record<string,string>;
    children: IParserNode[];
}

export interface IParserTextNode extends IParserNode {
    content: string;
}

export interface IParsedTree {
    content: IParserNode[];
}

export interface IRichTextParser {
    readonly parserEngine: IParserEngine
    parse(richTextElement: Elements.RichTextElement): IParsedTree;
};

export interface IParserEngine {
    parse(html: string): NodeHTMLElement | HTMLElement;
}
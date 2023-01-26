import { Elements, IContentItem, ILink, IParserElement, IRichTextImage } from "@kontent-ai/delivery-sdk";
import { RichTextBrowserParser } from "../parsers/RichTextBrowserParser";
import { RichTextNodeParser } from "../parsers/RichTextNodeParser";
import { IParsedTree, IParserHtmlNode, IParserNode, IRichTextParser } from "./parser-models";

export interface IRichTextElementResolver<TResult> {
    resolve(input: Elements.RichTextElement): TResult;
}

export interface IResolverInput<TOutput> {
    contentItemResolver?: IRichTextContentItemResolver<TOutput>;
    urlResolver?: IRichTextUrlResolver<TOutput>;
    imageResolver?: IRichTextImageResolver<TOutput>;
    parser?: IRichTextParser;
}

export type IRichTextContentItemResolver<TOutput> = (
    itemCodename: string,
    contentItem?: IContentItem
) => IRichTextContentItemResult<TOutput>;

export type IRichTextUrlResolver<TOutput> = (
    linkId: string,
    linkText: string,
    links: ILink[]
) => IRichTextUrlResult<TOutput>;

export type IRichTextImageResolver<TOutput> = (
    imageId: string,
    image?: IRichTextImage
) => IRichTextImageResult<TOutput>

export interface IRichTextContentItemResult<TOutput> {
    resolvedContent: TOutput;
}

export interface IRichTextUrlResult<TOutput> {
    resolvedUrl: TOutput;
}

export interface IRichTextImageResult<TOutput> {
    resolvedImage: TOutput;
}

export interface IRichTextHtmlImageResult extends IRichTextImageResult<string> {}
export interface IRichTextHtmlUrlResult extends IRichTextUrlResult<string> {}
export interface IRichTextHtmlContentItemResult extends IRichTextContentItemResult<string> {}
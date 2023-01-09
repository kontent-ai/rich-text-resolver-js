import { Elements, IContentItem, ILink, IParserElement, IRichTextImage } from "@kontent-ai/delivery-sdk";
import { IParsedTree, IParserHtmlNode, IParserNode } from "./IRichTextToJsonTransformer";

export interface IParsedTreeResolver<TInput, TResult> {
    resolve(input: TInput): TResult;
}

export interface IResolverInput<TOutput> {
    element: Elements.RichTextElement;
    contentItemResolver?: IRichTextContentItemResolver<TOutput>;
    urlResolver?: IRichTextUrlResolver<TOutput>;
    imageResolver?: IRichTextImageResolver<TOutput>;   
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
import { Elements } from "@kontent-ai/delivery-sdk";
import { IRichTextParser } from "../models/parser-models";
import { IRichTextElementResolver, IResolverInput, IRichTextContentItemResolver, IRichTextImageResolver, IRichTextUrlResolver } from "../models/resolver-models";
import { RichTextBrowserParser } from "../parsers/RichTextBrowserParser";

export abstract class RichTextBaseResolver<T> implements IRichTextElementResolver<T>{
    protected _parser: IRichTextParser;
    protected _contentItemResolver?: IRichTextContentItemResolver<T>;
    protected _urlResolver?: IRichTextUrlResolver<T>;
    protected _imageResolver?: IRichTextImageResolver<T>;

    constructor(input: IResolverInput<T>) {
        this._contentItemResolver = input.contentItemResolver,
        this._urlResolver = input.urlResolver,
        this._imageResolver = input.imageResolver,
        this._parser = input.parser ?? new RichTextBrowserParser();
    }

    abstract resolve(input: Elements.RichTextElement): T;
}
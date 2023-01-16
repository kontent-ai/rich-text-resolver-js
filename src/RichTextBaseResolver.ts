import { Elements } from "@kontent-ai/delivery-sdk";
import { IRichTextElementResolver, IResolverInput, IRichTextContentItemResolver, IRichTextImageResolver, IRichTextUrlResolver } from "./models/resolver-models";
import { Transformer } from "./RichTextTransformer";

export abstract class RichTextBaseResolver<T> implements IRichTextElementResolver<T>{
    protected _parser: Transformer;
    protected _contentItemResolver?: IRichTextContentItemResolver<T>;
    protected _urlResolver?: IRichTextUrlResolver<T>;
    protected _imageResolver?: IRichTextImageResolver<T>;

    constructor(input: IResolverInput<T>) {
        this._contentItemResolver = input.contentItemResolver ?? undefined,
        this._urlResolver = input.urlResolver ?? undefined,
        this._imageResolver = input.imageResolver ?? undefined,
        this._parser = new Transformer();
    }

    abstract resolve(input: Elements.RichTextElement): T;
}
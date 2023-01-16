import { Elements, IParserElement, IRichTextImage } from "@kontent-ai/delivery-sdk";
import { IRichTextElementResolver, IResolverInput, IRichTextContentItemResolver, IRichTextImageResolver, IRichTextUrlResolver } from "./models/resolver-models";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode } from "./models/parser-models";
import { Transformer } from "./RichTextTransformer";
import { HTMLElement } from "node-html-parser";
import { isElement, isImage, isItemLink, isLinkedItem, isText, isUnPairedElement } from "./utils/resolverUtils";
import { BaseRichTextResolver } from "@kontent-ai/delivery-sdk/dist/cjs/resolvers/rich-text/base/base-rich-text-resolver";
import { RichTextBaseResolver } from "./RichTextBaseResolver";

export class RichTextObjectResolver<TObject> extends RichTextBaseResolver<TObject> {
    constructor(input: IResolverInput<TObject>) {
        super(input);
    }

    resolve(input: Elements.RichTextElement): TObject {
        throw new Error("Method not implemented.");
    }
}
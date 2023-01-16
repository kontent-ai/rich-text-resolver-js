import { Elements, IParserElement, IRichTextImage } from "@kontent-ai/delivery-sdk";
import { IRichTextElementResolver, IResolverInput, IRichTextContentItemResolver, IRichTextImageResolver, IRichTextUrlResolver } from "./models/resolver-models";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode } from "./models/parser-models";
import { Transformer } from "./RichTextTransformer";
import { HTMLElement } from "node-html-parser";
import { isElement, isImage, isItemLink, isLinkedItem, isText, isUnPairedElement } from "./utils/resolverUtils";
import { BaseRichTextResolver } from "@kontent-ai/delivery-sdk/dist/cjs/resolvers/rich-text/base/base-rich-text-resolver";
import { RichTextBaseResolver } from "./RichTextBaseResolver";

export class RichTextJsonResolver extends RichTextBaseResolver<any> {
    constructor(input: IResolverInput<any>) {
        super(input);
    }

    private resolveNode(node: IParserNode, element: Elements.RichTextElement): any {
        var resolvedJson: any = {};
    }

    resolve(element: Elements.RichTextElement): any {
        let parsedTree = this._parser.transform(this._parser.parse(element).firstChild);
        return parsedTree.content.map((node) => this.resolveNode(node, element))
    }
}
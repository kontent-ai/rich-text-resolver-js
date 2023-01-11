import { Elements, IParserElement, IRichTextImage } from "@kontent-ai/delivery-sdk";
import { IRichTextElementResolver, IResolverInput, IRichTextContentItemResolver, IRichTextImageResolver, IRichTextUrlResolver } from "./models/resolver-models";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode } from "./models/parser-models";
import { Transformer } from "./RichTextTransformer";
import { HTMLElement } from "node-html-parser";
import { isElement, isLinkedItem, isText, isUnPairedElement } from "./utils/resolverUtils";

export class RichTextHtmlResolver implements IRichTextElementResolver<string> {
    private _parser = new Transformer();
    private _contentItemResolver?: IRichTextContentItemResolver<string>;
    private _urlResolver?: IRichTextUrlResolver<string>;
    private _imageResolver?: IRichTextImageResolver<string>;

    // constructor(
    //     contentItemResolver?: IRichTextContentItemResolver<string>,
    //     urlResolver?: IRichTextUrlResolver<string>,
    //     imageResolver?: IRichTextImageResolver<string>,
    // ) {
    //     this._contentItemResolver = contentItemResolver ?? undefined;
    //     this._urlResolver = urlResolver ?? undefined;
    //     this._imageResolver = imageResolver ?? undefined;
    // }

    constructor(input: IResolverInput<string>) {
        this._contentItemResolver = input.contentItemResolver ?? undefined,
        this._urlResolver = input.urlResolver ?? undefined,
        this._imageResolver = input.imageResolver ?? undefined
    }

    private resolveNode(node: IParserNode, element: Elements.RichTextElement): string {
        var resolvedHtml: string = '';

        if (isText(node)) {
            resolvedHtml += node.content;
        }

        else if (isUnPairedElement(node)) {
            resolvedHtml += `<${node.name}>`;
        }

        else if (isLinkedItem(node) && this._contentItemResolver) {
            var currentItemCodename = node.attributes['data-codename'];
            var currentItem = element.linkedItems.find(element => element.system.codename = currentItemCodename);
            resolvedHtml += this._contentItemResolver(currentItemCodename, currentItem).resolvedContent;
        }

        else if (isElement(node)) {
            resolvedHtml = resolvedHtml + `<${node.name + this.spreadAttributes(node.attributes)}>`

            if (node.children.length > 0) {
                node.children.forEach((node) => (resolvedHtml += this.resolveNode(node, element)));
            }

            resolvedHtml = resolvedHtml + `</${node.name}>`
        }

        return resolvedHtml;
    }

    private spreadAttributes(attributes: Record<string,string>): string {
        let convertedAttributes = ``;
        for (const attribute in attributes) {
            convertedAttributes += ` ${attribute}="${attributes[attribute]}"`
        }

        return convertedAttributes;
    }

    resolve(element: Elements.RichTextElement): string {
        let parsedTree = this._parser.transform(this._parser.parse(element).firstChild);
        return parsedTree.content.map((node) => this.resolveNode(node, element)).toString();
    }
}
import { Elements, IParserElement, IRichTextImage } from "@kontent-ai/delivery-sdk";
import { IRichTextElementResolver, IResolverInput, IRichTextContentItemResolver, IRichTextImageResolver, IRichTextUrlResolver } from "./models/resolver-models";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode } from "./models/parser-models";
import { Transformer } from "./RichTextTransformer";
import { HTMLElement } from "node-html-parser";

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
        switch (node.type) {
            case 'text':
                resolvedHtml = resolvedHtml + (<IParserTextNode>node).content;
                break;
            
            case 'tag': {
                let htmlNode = node as IParserHtmlNode

                if (htmlNode.name === 'br') {
                    resolvedHtml += '<br>';
                    break;
                }

                if (htmlNode.name === 'object' && this._contentItemResolver) {
                    var currentItemCodename = htmlNode.attributes['data-codename'];
                    var currentItem = element.linkedItems.find(element => element.system.codename = currentItemCodename);
                    resolvedHtml += this._contentItemResolver(currentItemCodename, currentItem).resolvedContent;
                    break;
                }

                resolvedHtml = resolvedHtml + `<${htmlNode.name + this.spreadAttributes(htmlNode.attributes)}>`

                if (htmlNode.children.length > 0) {
                    htmlNode.children.forEach((node: IParserNode) => (resolvedHtml += this.resolveNode(node, element)));
                }

                resolvedHtml = resolvedHtml + `</${htmlNode.name}>`
            }

            default:
                break;
        }

        return resolvedHtml;
    }

    private spreadAttributes(attributes: Record<string,string>): string {
        var convertedAttributes = ``;
        for (const attribute in attributes) {
            convertedAttributes += ` ${attribute}="${attributes[attribute]}"`
        }

        return convertedAttributes;
    }

    resolve(element: Elements.RichTextElement): string {
        var parsedTree = this._parser.transform(this._parser.parse(element).firstChild);
        return parsedTree.content.map((node) => this.resolveNode(node, element)).toString();
    }
}
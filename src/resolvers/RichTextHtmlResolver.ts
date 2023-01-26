import { Elements } from "@kontent-ai/delivery-sdk";
import { IResolverInput } from "../models/resolver-models";
import { IParserNode } from "../models/parser-models";
import { isElement, isImage, isItemLink, isLinkedItem, isText, isUnPairedElement } from "../utils/resolverUtils";
import { RichTextBaseResolver } from "./RichTextBaseResolver";

export class RichTextHtmlResolver extends RichTextBaseResolver<string> {
    constructor(input: IResolverInput<string>) {
        super(input);
    }

    private resolveNode(node: IParserNode, element: Elements.RichTextElement): string {
        let resolvedHtml: string = '';

        if (isText(node)) {
            resolvedHtml += node.content;
        }

        else if (isUnPairedElement(node)) {
            resolvedHtml += `<${node.name + this.spreadAttributes(node.attributes)}>`;
        }

        else if (isItemLink(node) && this._urlResolver) {
            let linkId = node.attributes['data-item-id'];
            let linkText = '';
            
            if (node.children.length > 0) {
                node.children.forEach((childNode) => (linkText += this.resolveNode(childNode, element)))
            }

            resolvedHtml += this._urlResolver(linkId, linkText, element.links).resolvedUrl;
        }

        else if (isImage(node) && this._imageResolver) {
            let assetId = node.attributes['data-asset-id'];
            let image = element.images.find(image => image.imageId === assetId);

            resolvedHtml += this._imageResolver(assetId, image)           
        }

        else if (isLinkedItem(node) && this._contentItemResolver) {
            let currentItemCodename = node.attributes['data-codename'];
            let currentItem = element.linkedItems.find(item => item.system.codename === currentItemCodename);
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
        let parsedTree = this._parser.parse(element);
        return parsedTree.content.map((node) => this.resolveNode(node, element)).toString();
    }
}
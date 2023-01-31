"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextHtmlResolver = void 0;
const resolverUtils_1 = require("../utils/resolverUtils");
const RichTextBaseResolver_1 = require("./RichTextBaseResolver");
class RichTextHtmlResolver extends RichTextBaseResolver_1.RichTextBaseResolver {
    constructor(input) {
        super(input);
    }
    resolveNode(node, element) {
        let resolvedHtml = '';
        if ((0, resolverUtils_1.isText)(node)) {
            resolvedHtml += node.content;
        }
        else if ((0, resolverUtils_1.isUnPairedElement)(node)) {
            resolvedHtml += `<${node.name + this.spreadAttributes(node.attributes)}>`;
        }
        else if ((0, resolverUtils_1.isItemLink)(node) && this._urlResolver) {
            let linkId = node.attributes['data-item-id'];
            let linkText = '';
            if (node.children.length > 0) {
                node.children.forEach((childNode) => (linkText += this.resolveNode(childNode, element)));
            }
            resolvedHtml += this._urlResolver(linkId, linkText, element.links).resolvedUrl;
        }
        else if ((0, resolverUtils_1.isImage)(node) && this._imageResolver) {
            let assetId = node.attributes['data-asset-id'];
            let image = element.images.find(image => image.imageId === assetId);
            resolvedHtml += this._imageResolver(assetId, image);
        }
        else if ((0, resolverUtils_1.isLinkedItem)(node) && this._contentItemResolver) {
            let currentItemCodename = node.attributes['data-codename'];
            let currentItem = element.linkedItems.find(item => item.system.codename === currentItemCodename);
            resolvedHtml += this._contentItemResolver(currentItemCodename, currentItem).resolvedContent;
        }
        else if ((0, resolverUtils_1.isElement)(node)) {
            resolvedHtml = resolvedHtml + `<${node.name + this.spreadAttributes(node.attributes)}>`;
            if (node.children.length > 0) {
                node.children.forEach((node) => (resolvedHtml += this.resolveNode(node, element)));
            }
            resolvedHtml = resolvedHtml + `</${node.name}>`;
        }
        return resolvedHtml;
    }
    spreadAttributes(attributes) {
        let convertedAttributes = ``;
        for (const attribute in attributes) {
            convertedAttributes += ` ${attribute}="${attributes[attribute]}"`;
        }
        return convertedAttributes;
    }
    resolve(element) {
        let parsedTree = this._parser.parse(element);
        return parsedTree.content.map((node) => this.resolveNode(node, element)).toString();
    }
}
exports.RichTextHtmlResolver = RichTextHtmlResolver;

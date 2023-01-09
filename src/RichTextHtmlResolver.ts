import { Elements, IParserElement } from "@kontent-ai/delivery-sdk";
import { IParsedTreeResolver, IResolverInput, IRichTextContentItemResolver } from "./IParsedTreeResolver";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode } from "./IRichTextToJsonTransformer";
import { transformer } from "./RichTextToJsonTransformer";
import { HTMLElement } from "node-html-parser";

class RichTextHtmlResolver {//implements IParsedTreeResolver<IResolverInput<string>, string> {
    private _parser = transformer;

    private resolveNode(node: IParserNode): string {
        var resolvedHtml: string = '';
        switch (node.type) {
            case 'text':
                resolvedHtml = resolvedHtml + (<IParserTextNode>node).content;
                break;
            
            case 'tag': {
                let htmlNode = node as IParserHtmlNode
                if (htmlNode.name === 'object') {
                    resolvedHtml += "<p>resolved rich text</p>";
                    break;
                }
                resolvedHtml = resolvedHtml + `<${htmlNode.name + this.spreadAttributes(htmlNode.attributes)}>`
                if (htmlNode.children.length > 0) {
                    htmlNode.children.forEach((node: IParserNode) => (resolvedHtml += this.resolveNode(node)));
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

    // resolve(input: IResolverInput<string>): string {
    //     return input.parsedRichText.content.map((node) => this.resolveNode(node)).toString();
    // }
    
    resolve(parsedTree: IParserNode[]): string {
        return parsedTree.map((node) => this.resolveNode(node)).toString();
    }  
}

export const richTextHtmlResolver = new RichTextHtmlResolver();
import { Elements } from "@kontent-ai/delivery-sdk";
import { IHtmlNode, IRichTextToJsonTransformer, IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode } from "./IRichTextToJsonTransformer";
import { parse, HTMLElement, Node, NodeType, TextNode } from 'node-html-parser';


class Transformer { //implements IRichTextToJsonTransformer {
    transform(dummyRichText: Elements.RichTextElement): IHtmlNode[] {
        const parsedHtml = parse(dummyRichText.value);
        parsedHtml.childNodes
        return this.remapNode(parsedHtml);
    }
    
    traverse(parsedRichText: Node): IParserNode[] {
        var transformedTree: IParsedTree = {
            content: []
        };

        var transformedNodes: IParserNode[] = [];

        if (parsedRichText.childNodes.length > 0 || parsedRichText.nodeType) {
            switch (parsedRichText.nodeType) {
                case 1: {
                    let htmlNode: IParserHtmlNode = {
                        name: (<HTMLElement>parsedRichText).rawTagName,
                        attributes: (<HTMLElement>parsedRichText).attributes,
                        children: (<HTMLElement>parsedRichText).childNodes.flatMap((childNode: Node) => this.traverse(childNode)),
                        type: 'tag'
                    }
                    transformedNodes.push(htmlNode);
                    break;
                }

                case 3: {
                    let textNode: IParserTextNode = {
                        content: (<TextNode>parsedRichText).rawText,
                        type: 'text'
                    }
                    transformedNodes.push(textNode);
                }
                default:
                    break;
            }
        }

        return transformedNodes;
    }

    parseInternal(richTextElement: Elements.RichTextElement): HTMLElement {
        return parse(richTextElement.value);
    }

    parse(dummyRichText: Elements.RichTextElement): HTMLElement {
        var parsedTree: IParserNode[] = [];
        const parseResult = parse(dummyRichText.value);

        return parseResult;
    }

    remapNode(parsedHtml: HTMLElement): IHtmlNode[] {
        var nodes: IHtmlNode[] = [];
        if(parsedHtml.childNodes.length > 0 || parsedHtml.rawTagName) {            
            nodes.push({
                tagName: parsedHtml.rawTagName ?? "",
                attributes: parsedHtml.attributes ?? {},
                innerContent: parsedHtml.innerHTML ?? '',
                children: parsedHtml.childNodes.flatMap((element) => this.remapNode(element as HTMLElement))
            });
        }
        return nodes;
    }
}

export const transformer = new Transformer();
import { Elements } from "@kontent-ai/delivery-sdk";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode, IRichTextTransformer } from "./models/parser-models";
import { parse, HTMLElement, Node, TextNode } from 'node-html-parser';


export class Transformer implements IRichTextTransformer {  
    private transformInternal(parsedRichText: Node): IParserNode[] {

        var transformedNodes: IParserNode[] = [];

        if (parsedRichText.childNodes.length > 0 || parsedRichText.nodeType) {
            switch (parsedRichText.nodeType) {
                case 1: {
                    let htmlNode: IParserHtmlNode = {
                        name: (<HTMLElement>parsedRichText).rawTagName,
                        attributes: (<HTMLElement>parsedRichText).attributes,
                        children: (<HTMLElement>parsedRichText).childNodes.flatMap((childNode: Node) => this.transformInternal(childNode)),
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

    transform(parsedRichText: Node): IParsedTree {
        var transformedTree: IParsedTree = {
            content: this.transformInternal(parsedRichText)
        }

        return transformedTree;
    }

    parse(richTextElement: Elements.RichTextElement): HTMLElement {
        const parseResult = parse(richTextElement.value);

        return parseResult;
    }
}
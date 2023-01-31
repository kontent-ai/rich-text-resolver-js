import { Elements } from "@kontent-ai/delivery-sdk";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode, IRichTextParser } from "../models/parser-models";
import { Node } from 'node-html-parser';
import { isElementNode, isRootNode, isTextNode } from "../utils/nodeParserUtils";
import { NodeParser } from "./engine/NodeParser";


export class RichTextNodeParser implements IRichTextParser {
    readonly parserEngine = new NodeParser();    
    private parseRecursively(parsedRichText: Node): IParserNode[] {
        let parsedNodes: IParserNode[] = [];

        if (isRootNode(parsedRichText)) {
            return this.parseRecursively(parsedRichText.firstChild);
        }

        if (isElementNode(parsedRichText)) {
            let htmlNode: IParserHtmlNode = {
                name: parsedRichText.rawTagName,
                attributes: parsedRichText.attributes,
                children: parsedRichText.childNodes ? parsedRichText.childNodes.flatMap((childNode: Node) => this.parseRecursively(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (isTextNode(parsedRichText)) {
            let textNode: IParserTextNode = {
                content: parsedRichText.rawText,
                type: 'text'
            }

            parsedNodes.push(textNode);
        }

        return parsedNodes;
    }

    parse(richTextElement: Elements.RichTextElement): IParsedTree {
        const parseResult = this.parserEngine.parse(richTextElement.value);
        const transformedTree: IParsedTree = {
            content: this.parseRecursively(parseResult)
        }

        return transformedTree;
    }
}
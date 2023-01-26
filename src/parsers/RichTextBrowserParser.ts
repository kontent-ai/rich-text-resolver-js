import { Elements } from "@kontent-ai/delivery-sdk";
import { IParsedTree, IParserHtmlNode, IParserNode, IParserTextNode, IRichTextParser} from "../models/parser-models";
import { isElementNode, isRootNode, isTextNode, convertDomNodeAttributes } from "../utils/browserParserUtils";
import { BrowserParser } from "./engine/BrowserParser";

export class RichTextBrowserParser implements IRichTextParser {
    readonly parserEngine = new BrowserParser();
    private parseRecursively(parsedRichText: Node): IParserNode[] {
        let parsedNodes: IParserNode[] = [];

        if (isRootNode(parsedRichText) && parsedRichText.firstChild) {
            return this.parseRecursively(parsedRichText.firstChild);
        }

        if (isElementNode(parsedRichText)) {
            let htmlNode: IParserHtmlNode = {
                name: parsedRichText.tagName.toLowerCase(),
                attributes: parsedRichText.hasAttributes() ? convertDomNodeAttributes(parsedRichText.attributes) : {},
                children: parsedRichText.hasChildNodes() ? Array.from(parsedRichText.childNodes).flatMap((childNode: Node) => this.parseRecursively(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (isTextNode(parsedRichText)) {
            let textNode: IParserTextNode = {
                content: parsedRichText.nodeValue ?? '',
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
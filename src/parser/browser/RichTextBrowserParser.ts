import { IDomHtmlNode, IDomNode, IDomTextNode, IParserEngine, IOutputResult, IRichTextParser } from "../parser-models";
import { convertDomNodeAttributes, isElementNode, isRootNode, isTextNode } from "../../utils/";
import { BrowserParser } from "./BrowserParser";

export class RichTextBrowserParser implements IRichTextParser<string, IOutputResult> {
    private readonly _parserEngine: IParserEngine;
    
    constructor() {
        this._parserEngine = new BrowserParser();
    }

    parse(input: string): IOutputResult {
        const document = this._parserEngine.parse(input.replaceAll('\n', ''));

        if (isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.children).flatMap((node) => this.parseInternal(node))
            }

        }
        else {
            throw new Error();
        }
    }

    private parseInternal(document: Node): IDomNode[] {
        const parsedNodes: IDomNode[] = [];

        if (isElementNode(document)) {
            const htmlNode: IDomHtmlNode = {
                tagName: document.tagName.toLowerCase(),
                attributes: document.hasAttributes() ? convertDomNodeAttributes(document.attributes) : {},
                children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap((childNode: Node) => this.parseInternal(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (isTextNode(document)) {
            const textNode: IDomTextNode = {
                content: document.nodeValue ?? '',
                type: 'text'
            }

            parsedNodes.push(textNode);
        }

        return parsedNodes;
    }
}
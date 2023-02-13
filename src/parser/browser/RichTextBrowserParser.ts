import { IDomHtmlNode, IDomNode, IDomTextNode, IParserEngine, IOutputResult, IRichTextParser, RichTextInput } from "../parser-models";
import { convertDomNodeAttributes, isElementNode, isRootNode, isTextNode } from "../../utils/";
import { BrowserParser } from "./BrowserParser";

export class RichTextBrowserParser implements IRichTextParser<RichTextInput, IOutputResult> {
    private readonly _parserEngine: IParserEngine;
    
    constructor() {
        this._parserEngine = new BrowserParser();
    }

    parse(input: RichTextInput): IOutputResult { // TODO possible to unify into a base class, regardless of parser used?
        const document = this._parserEngine.parse(input.value);

        if (isRootNode(document) && document.body.firstChild) {
            return {
                childNodes: Array.from(document.body.childNodes).flatMap((node) => this.parseInternal(node))
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
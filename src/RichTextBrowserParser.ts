import { IDomHtmlNode, IDomNode, IDomTextNode } from "./IDomNode";
import { IParser } from "./IParser";
import { convertDomNodeAttributes, IParseResult, isElementNode, isRootNode, isTextNode, NodeType } from "./utils/parser-utils";

export class RichTextBrowserParser implements IParser<string> {
    private readonly _parser: DOMParser;
    constructor() {
        this._parser = new DOMParser();
    }

    parse(value: string): IParseResult {
        const document = this._parser.parseFromString(value, 'text/html');

        if (isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.childNodes).flatMap((node) => this.parseInternal(node))
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
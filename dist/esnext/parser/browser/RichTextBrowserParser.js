import { convertDomNodeAttributes, isElementNode, isRootNode, isTextNode } from "../../utils/";
import { BrowserParser } from "./BrowserParser";
export class RichTextBrowserParser {
    constructor() {
        this._parserEngine = new BrowserParser();
    }
    parse(input) {
        const document = this._parserEngine.parse(input);
        if (isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.children).flatMap((node) => this.parseInternal(node))
            };
        }
        else {
            throw new Error();
        }
    }
    parseInternal(document) {
        var _a;
        const parsedNodes = [];
        if (isElementNode(document)) {
            const htmlNode = {
                tagName: document.tagName.toLowerCase(),
                attributes: document.hasAttributes() ? convertDomNodeAttributes(document.attributes) : {},
                children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap((childNode) => this.parseInternal(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if (isTextNode(document)) {
            const textNode = {
                content: (_a = document.nodeValue) !== null && _a !== void 0 ? _a : '',
                type: 'text'
            };
            parsedNodes.push(textNode);
        }
        return parsedNodes;
    }
}

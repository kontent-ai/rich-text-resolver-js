"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextBrowserParser = void 0;
const utils_1 = require("../../utils/");
const BrowserParser_1 = require("./BrowserParser");
class RichTextBrowserParser {
    constructor() {
        this._parserEngine = new BrowserParser_1.BrowserParser();
    }
    parse(input) {
        const document = this._parserEngine.parse(input);
        if ((0, utils_1.isRootNode)(document) && document.body.firstChild) {
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
        if ((0, utils_1.isElementNode)(document)) {
            const htmlNode = {
                tagName: document.tagName.toLowerCase(),
                attributes: document.hasAttributes() ? (0, utils_1.convertDomNodeAttributes)(document.attributes) : {},
                children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap((childNode) => this.parseInternal(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if ((0, utils_1.isTextNode)(document)) {
            const textNode = {
                content: (_a = document.nodeValue) !== null && _a !== void 0 ? _a : '',
                type: 'text'
            };
            parsedNodes.push(textNode);
        }
        return parsedNodes;
    }
}
exports.RichTextBrowserParser = RichTextBrowserParser;

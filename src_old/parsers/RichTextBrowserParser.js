"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextBrowserParser = void 0;
const browserParserUtils_1 = require("../utils/browserParserUtils");
const BrowserParser_1 = require("./engine/BrowserParser");
class RichTextBrowserParser {
    constructor() {
        this.parserEngine = new BrowserParser_1.BrowserParser();
    }
    parseRecursively(parsedRichText) {
        var _a;
        let parsedNodes = [];
        if ((0, browserParserUtils_1.isRootNode)(parsedRichText) && parsedRichText.firstChild) {
            return this.parseRecursively(parsedRichText.firstChild);
        }
        if ((0, browserParserUtils_1.isElementNode)(parsedRichText)) {
            let htmlNode = {
                name: parsedRichText.tagName.toLowerCase(),
                attributes: parsedRichText.hasAttributes() ? (0, browserParserUtils_1.convertDomNodeAttributes)(parsedRichText.attributes) : {},
                children: parsedRichText.hasChildNodes() ? Array.from(parsedRichText.childNodes).flatMap((childNode) => this.parseRecursively(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if ((0, browserParserUtils_1.isTextNode)(parsedRichText)) {
            let textNode = {
                content: (_a = parsedRichText.nodeValue) !== null && _a !== void 0 ? _a : '',
                type: 'text'
            };
            parsedNodes.push(textNode);
        }
        return parsedNodes;
    }
    parse(richTextElement) {
        const parseResult = this.parserEngine.parse(richTextElement.value);
        const transformedTree = {
            content: this.parseRecursively(parseResult)
        };
        return transformedTree;
    }
}
exports.RichTextBrowserParser = RichTextBrowserParser;

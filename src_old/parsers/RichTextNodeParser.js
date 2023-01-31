"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextNodeParser = void 0;
const nodeParserUtils_1 = require("../utils/nodeParserUtils");
const NodeParser_1 = require("./engine/NodeParser");
class RichTextNodeParser {
    constructor() {
        this.parserEngine = new NodeParser_1.NodeParser();
    }
    parseRecursively(parsedRichText) {
        let parsedNodes = [];
        if ((0, nodeParserUtils_1.isRootNode)(parsedRichText)) {
            return this.parseRecursively(parsedRichText.firstChild);
        }
        if ((0, nodeParserUtils_1.isElementNode)(parsedRichText)) {
            let htmlNode = {
                name: parsedRichText.rawTagName,
                attributes: parsedRichText.attributes,
                children: parsedRichText.childNodes ? parsedRichText.childNodes.flatMap((childNode) => this.parseRecursively(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if ((0, nodeParserUtils_1.isTextNode)(parsedRichText)) {
            let textNode = {
                content: parsedRichText.rawText,
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
exports.RichTextNodeParser = RichTextNodeParser;

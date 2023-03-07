"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextNodeParser = void 0;
const NodeParser_1 = require("./NodeParser");
const rich_text_node_parser_utils_1 = require("../../utils/rich-text-node-parser-utils");
class RichTextNodeParser {
    constructor() {
        this._parserEngine = NodeParser_1.NodeParser;
    }
    parse(input) {
        const node = this._parserEngine.parse(input);
        if ((0, rich_text_node_parser_utils_1.isRootNode)(node)) {
            return {
                children: node.childNodes.flatMap((node) => this.parseInternal(node))
            };
        }
        else {
            throw new Error();
        }
    }
    parseInternal(node) {
        var _a;
        const parsedNodes = [];
        if ((0, rich_text_node_parser_utils_1.isElementNode)(node)) {
            const htmlNode = {
                tagName: node.tagName.toLowerCase(),
                attributes: node.attributes,
                children: node.childNodes ? node.childNodes.flatMap((childNode) => this.parseInternal(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if ((0, rich_text_node_parser_utils_1.isTextNode)(node)) {
            const textNode = {
                content: (_a = node.text) !== null && _a !== void 0 ? _a : '',
                type: 'text'
            };
            parsedNodes.push(textNode);
        }
        return parsedNodes;
    }
}
exports.RichTextNodeParser = RichTextNodeParser;

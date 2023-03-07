import { NodeParser } from "./NodeParser";
import { isElementNode, isRootNode, isTextNode } from "../../utils/rich-text-node-parser-utils";
export class RichTextNodeParser {
    _parserEngine;
    constructor() {
        this._parserEngine = NodeParser;
    }
    parse(input) {
        const node = this._parserEngine.parse(input);
        if (isRootNode(node)) {
            return {
                children: node.childNodes.flatMap((node) => this.parseInternal(node))
            };
        }
        else {
            throw new Error();
        }
    }
    parseInternal(node) {
        const parsedNodes = [];
        if (isElementNode(node)) {
            const htmlNode = {
                tagName: node.tagName.toLowerCase(),
                attributes: node.attributes,
                children: node.childNodes ? node.childNodes.flatMap((childNode) => this.parseInternal(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if (isTextNode(node)) {
            const textNode = {
                content: node.text ?? '',
                type: 'text'
            };
            parsedNodes.push(textNode);
        }
        return parsedNodes;
    }
}

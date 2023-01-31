"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextBrowserParser = void 0;
var NodeType;
(function (NodeType) {
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
})(NodeType || (NodeType = {}));
class RichTextBrowserParser {
    constructor() {
        this.isRootNode = (domNode) => domNode.nodeType === NodeType.DOCUMENT_NODE;
        this.isTextNode = (domNode) => domNode.nodeType === NodeType.TEXT_NODE;
        this.isElementNode = (domNode) => domNode.nodeType === NodeType.ELEMENT_NODE;
        this.convertDomNodeAttributes = (domNodeAttributes) => {
            let convertedAttributes = {};
            for (const attr of domNodeAttributes) {
                convertedAttributes[attr.name] = attr.value;
            }
            return convertedAttributes;
        };
        this._parser = new DOMParser();
    }
    parse(value) {
        const document = this._parser.parseFromString(value, 'text/html');
        if (this.isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.childNodes).flatMap((node) => this.parseInternal(node))
            };
        }
        else {
            throw new Error();
        }
    }
    parseInternal(document) {
        var _a;
        const parsedNodes = [];
        if (this.isElementNode(document)) {
            const htmlNode = {
                tagName: document.tagName.toLowerCase(),
                attributes: document.hasAttributes() ? this.convertDomNodeAttributes(document.attributes) : {},
                children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap((childNode) => this.parseInternal(childNode)) : [],
                type: 'tag'
            };
            parsedNodes.push(htmlNode);
        }
        else if (this.isTextNode(document)) {
            let textNode = {
                content: (_a = document.nodeValue) !== null && _a !== void 0 ? _a : '',
                type: 'text'
            };
            parsedNodes.push(textNode);
        }
        return parsedNodes;
    }
}
exports.RichTextBrowserParser = RichTextBrowserParser;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDomNodeAttributes = exports.isRootNode = exports.isElementNode = exports.isTextNode = void 0;
var NodeType;
(function (NodeType) {
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
})(NodeType || (NodeType = {}));
const isTextNode = (domNode) => domNode.nodeType === NodeType.TEXT_NODE;
exports.isTextNode = isTextNode;
const isElementNode = (domNode) => domNode.nodeType === NodeType.ELEMENT_NODE;
exports.isElementNode = isElementNode;
const isRootNode = (domNode) => domNode.nodeType === NodeType.DOCUMENT_NODE;
exports.isRootNode = isRootNode;
const convertDomNodeAttributes = (domNodeAttributes) => {
    let convertedAttributes = {};
    for (const attr of domNodeAttributes) {
        convertedAttributes[attr.name] = attr.value;
    }
    return convertedAttributes;
};
exports.convertDomNodeAttributes = convertDomNodeAttributes;

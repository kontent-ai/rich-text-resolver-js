"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnPairedElement = exports.isItemLink = exports.isImage = exports.isLinkedItem = exports.isElement = exports.isText = exports.isElementNode = exports.isTextNode = exports.isRootNode = exports.convertDomNodeAttributes = exports.NodeType = void 0;
var NodeType;
(function (NodeType) {
    NodeType[NodeType["ELEMENT_NODE"] = 1] = "ELEMENT_NODE";
    NodeType[NodeType["TEXT_NODE"] = 3] = "TEXT_NODE";
    NodeType[NodeType["DOCUMENT_NODE"] = 9] = "DOCUMENT_NODE";
})(NodeType = exports.NodeType || (exports.NodeType = {}));
const convertDomNodeAttributes = (domNodeAttributes) => {
    let convertedAttributes = {};
    for (const attr of domNodeAttributes) {
        convertedAttributes[attr.name] = attr.value;
    }
    return convertedAttributes;
};
exports.convertDomNodeAttributes = convertDomNodeAttributes;
const isRootNode = (domNode) => domNode.nodeType === NodeType.DOCUMENT_NODE;
exports.isRootNode = isRootNode;
const isTextNode = (domNode) => domNode.nodeType === NodeType.TEXT_NODE;
exports.isTextNode = isTextNode;
const isElementNode = (domNode) => domNode.nodeType === NodeType.ELEMENT_NODE;
exports.isElementNode = isElementNode;
/**
 * Returns `true` for text nodes and type guards the node as `IDomTextNode`.
 */
const isText = (node) => node.type === 'text';
exports.isText = isText;
/**
 * Returns `true` for HTML nodes and type guards the node as `IDomHtmlNode`.
 */
const isElement = (node) => node.type === 'tag';
exports.isElement = isElement;
/**
 * Returns `true` if the node is a linked item node (`<object></object>`).
 */
const isLinkedItem = (node) => (0, exports.isElement)(node) &&
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';
exports.isLinkedItem = isLinkedItem;
/**
 * Returns `true` if the node is a rich text image node (`<figure></figure>`).
 */
const isImage = (node) => (0, exports.isElement)(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;
exports.isImage = isImage;
/**
 * Returns `true` if the node is a link to a content item.
 */
const isItemLink = (node) => (0, exports.isElement)(node) &&
    node.tagName === 'a' &&
    node.attributes['data-item-id'] ? true : false;
exports.isItemLink = isItemLink;
/**
 * Returns `true` if the node represents an unpaired element (`br, img, hr, meta`)
 */
const isUnPairedElement = (node) => (0, exports.isElement)(node) &&
    ['br', 'img', 'hr', 'meta'].includes(node.tagName);
exports.isUnPairedElement = isUnPairedElement;

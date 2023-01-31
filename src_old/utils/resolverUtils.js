"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnPairedElement = exports.isItemLink = exports.isImage = exports.isLinkedItem = exports.isText = exports.isElement = void 0;
const isElement = (domNode) => domNode.type === 'tag';
exports.isElement = isElement;
const isText = (domNode) => domNode.type === 'text';
exports.isText = isText;
const isLinkedItem = (domNode) => (0, exports.isElement)(domNode) &&
    domNode.name === 'object' &&
    domNode.attributes['type'] === 'application/kenticocloud';
exports.isLinkedItem = isLinkedItem;
const isImage = (domNode) => (0, exports.isElement)(domNode) &&
    domNode.name === 'figure' &&
    domNode.attributes['data-image-id'] ? true : false;
exports.isImage = isImage;
const isItemLink = (domNode) => (0, exports.isElement)(domNode) &&
    domNode.name === 'a' &&
    domNode.attributes['data-item-id'] ? true : false;
exports.isItemLink = isItemLink;
const isUnPairedElement = (domNode) => (0, exports.isElement)(domNode) &&
    ['br', 'img', 'hr', 'meta'].includes(domNode.name);
exports.isUnPairedElement = isUnPairedElement;

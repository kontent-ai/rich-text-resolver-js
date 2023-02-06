import { IDomHtmlNode, IDomNode, IDomTextNode } from "../parser/parser-models"
import { ILinkFunction } from "../resolver/resolver-models";

export const isText = (node: IDomNode): node is IDomTextNode =>
    node.type === 'text';

export const isElement = (node: IDomNode): node is IDomHtmlNode =>
    node.type === 'tag';

export const isLinkedItem = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) && 
    node.tagName === 'object' &&
    node.attributes['type'] === 'application/kenticocloud';

export const isImage = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) &&
    node.tagName === 'figure' &&
    node.attributes['data-image-id'] ? true : false;

export const isItemLink = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) &&
    node.tagName === 'a' &&
    node.attributes['data-item-id'] ? true : false;

export const isUnPairedElement = (node: IDomNode): node is IDomHtmlNode =>
    isElement(node) &&
    ['br', 'img', 'hr', 'meta'].includes(node.tagName);


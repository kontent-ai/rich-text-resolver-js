import { IParserHtmlNode, IParserNode, IParserTextNode } from "../models/parser-models";

export const isElement = (domNode: IParserNode): domNode is IParserHtmlNode =>
  domNode.type === 'tag';

export const isText = (domNode: IParserNode): domNode is IParserTextNode => 
    domNode.type === 'text'

export const isLinkedItem = (domNode: IParserNode): domNode is IParserHtmlNode =>
  isElement(domNode) &&
  domNode.name === 'object' &&
  domNode.attributes['type'] === 'application/kenticocloud';

export const isImage = (domNode: IParserNode): domNode is IParserHtmlNode =>
  isElement(domNode) &&
  domNode.name === 'figure' &&
  domNode.attributes['data-image-id'] ? true : false;

export const isItemLink = (domNode: IParserNode): domNode is IParserHtmlNode =>
  isElement(domNode) &&
  domNode.name === 'a' &&
  domNode.attributes['data-item-id'] ? true : false;

export const isUnPairedElement = (domNode: IParserNode): domNode is IParserHtmlNode =>
    isElement(domNode) &&
    ['br', 'img', 'hr', 'meta'].includes(domNode.name)
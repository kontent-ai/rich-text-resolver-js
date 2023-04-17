import {
convertDomNodeAttributes,
getAllNewLineAndWhiteSpace,
isElementNode,
isRootNode,
isTextNode
} from "../../utils"
import { IDomNode, IOutputResult } from "../parser-models";

export const parse = (input: string): IOutputResult => {
  const document = browserParse(input.replaceAll(getAllNewLineAndWhiteSpace, ''));

  if (isRootNode(document) && document.body.firstChild) {
    return {
      children: Array.from(document.body.children).flatMap(parseInternal),
    };

  }
  else {
    throw new Error("Cannot parse a node that is not a root node.");
  }
}

const parseInternal = (document: Node): IDomNode => {
  if (isElementNode(document)) {
    return {
      tagName: document.tagName.toLowerCase(),
      attributes: document.hasAttributes() ? convertDomNodeAttributes(document.attributes) : {},
      children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap(parseInternal) : [],
      type: 'tag',
    };
  }

  if (isTextNode(document)) {
    return {
      content: document.nodeValue ?? '',
      type: 'text',
    };
  }

  throw new Error("Unknown node");
};

const parser = new DOMParser();

const browserParse = (html: string) => parser.parseFromString(html, 'text/html');

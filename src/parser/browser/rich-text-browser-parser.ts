import {
convertDomNodeAttributes,
getAllNewLineAndWhiteSpace,
isElementNode,
isRootNode,
isTextNode
} from "../../utils/index.js"
import { DomNode, ParseResult } from "../parser-models.js";

export const parse = (input: string): ParseResult => {
  const parser = new DOMParser();
  const sanitizedInput = input.replaceAll(getAllNewLineAndWhiteSpace, '');
  
  const document = parser.parseFromString(sanitizedInput, 'text/html');

  if (isRootNode(document) && document.body.firstChild) {
    return {
      children: Array.from(document.body.children).flatMap(parseInternal),
    };

  }
  else {
    throw new Error("Cannot parse a node that is not a root node.");
  }
}

const parseInternal = (document: Node): DomNode => {
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

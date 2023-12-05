import * as NodeHtmlParser from 'node-html-parser';
import { Node } from "node-html-parser";

import { getAllNewLineAndWhiteSpace } from '../../utils/index.js';
import { isElementNode, isRootNode, isTextNode } from "../../utils/node-parser-utils.js";
import { IDomNode, IOutputResult } from '../parser-models.js';


export const parse = (input: string): IOutputResult => {
    const node = NodeHtmlParser.parse(input.replaceAll(getAllNewLineAndWhiteSpace, ''));

    if (!isRootNode(node)) {
        throw new Error("Cannot parse node that is not a root.");
    }

    return {
        children: node.childNodes.flatMap(parseInternal)
    }
};

const parseInternal = (node: Node): IDomNode => {
  if (isElementNode(node)) {
    return {
      tagName: node.tagName.toLowerCase(),
      attributes: node.attributes,
      children: node.childNodes.flatMap(parseInternal),
      type: 'tag'
    };
  }

  if (isTextNode(node)) {
    return {
      content: node.text,
      type: 'text'
    };
  }

  throw new Error("Unknown node");
}


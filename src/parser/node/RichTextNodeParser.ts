import * as NodeHtmlParser from 'node-html-parser';
import { IDomNode, IOutputResult } from "../../parser";
import { Node } from "node-html-parser";
import { isElementNode, isRootNode, isTextNode } from "../../utils/rich-text-node-parser-utils";

export const parse = (input: string): IOutputResult => {
    const regex = /\n\s*/g;
    const node = NodeHtmlParser.parse(input.replaceAll(regex, ''));

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
      children: node?.childNodes.flatMap(parseInternal) ?? [],
      type: 'tag'
    };
  }

  if (isTextNode(node)) {
    return {
      content: node.text ?? '',
      type: 'text'
    };
  }

  throw new Error("Unkown node");
}


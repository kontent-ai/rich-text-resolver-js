import type { Node } from "node-html-parser";
import * as NodeHtmlParser from "node-html-parser";

import { getAllNewLineAndWhiteSpace } from "../../utils/common-utils.js";
import { isElementNode, isTextNode } from "../../utils/node-parser-utils.js";
import type { DomNode } from "../parser-models.js";

export const parse = (input: string): DomNode[] => {
  const node = NodeHtmlParser.parse(input.replaceAll(getAllNewLineAndWhiteSpace, ""));

  return node.childNodes.flatMap(parseInternal);
};

const parseInternal = (node: Node): DomNode => {
  if (isElementNode(node)) {
    return {
      tagName: node.tagName.toLowerCase(),
      attributes: node.attributes,
      children: node.childNodes.flatMap(parseInternal),
      type: "tag",
    };
  }

  if (isTextNode(node)) {
    return {
      content: node.text,
      type: "text",
    };
  }

  throw new Error("Unknown node");
};

import * as NodeHtmlParser from "node-html-parser";
import { Node } from "node-html-parser";

import { getAllNewLineAndWhiteSpace, throwError } from "../../utils/index.js";
import { isElementNode, isRootNode, isTextNode } from "../../utils/node-parser-utils.js";
import { DomNode, ParseResult } from "../parser-models.js";

export const parse = (input: string): ParseResult => {
  const node = NodeHtmlParser.parse(input.replaceAll(getAllNewLineAndWhiteSpace, ""));

  return isRootNode(node)
    ? { children: node.childNodes.flatMap(parseInternal) }
    : throwError("Cannot parse node that is not a root");
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

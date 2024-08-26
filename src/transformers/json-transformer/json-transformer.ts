import { DomHtmlNode, DomNode, DomTextNode, ParseResult } from "../../parser/index.js";
import { isText } from "../../utils/index.js";

export type ResolveDomTextNodeType = ((node: DomTextNode) => unknown) | null;
export type ResolveDomHtmlNodeType = ((node: DomHtmlNode, traverse: (node: DomNode) => unknown) => unknown) | null;

type CustomResolversType = {
  resolveDomTextNode: ResolveDomTextNodeType;
  resolveDomHtmlNode: ResolveDomHtmlNodeType;
};

export type TransformDomNodeType = (
  node: DomNode,
  customResolvers: CustomResolversType,
) => unknown;

export const transformToJson = (
  result: ParseResult,
  customResolvers?: CustomResolversType,
) => customResolvers ? result.children.map(node => transformDomNode(node, customResolvers)) : result.children;

const nodeIdentity = (node: DomNode) => node;

const transformDomNode: TransformDomNodeType = (
  node: DomNode,
  { resolveDomHtmlNode, resolveDomTextNode }: CustomResolversType,
) => {
  if (isText(node)) {
    return resolveDomTextNode ? resolveDomTextNode(node) : nodeIdentity(node);
  }

  return resolveDomHtmlNode
    ? resolveDomHtmlNode(node, (node) => transformDomNode(node, { resolveDomHtmlNode, resolveDomTextNode }))
    : nodeIdentity(node);
};

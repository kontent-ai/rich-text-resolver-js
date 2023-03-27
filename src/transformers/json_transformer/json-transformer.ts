import { IDomHtmlNode, IDomNode, IDomTextNode, IOutputResult } from "../../parser"
import { isText } from "../../utils"

export type ResolveIDomTextNodeType = ((node: IDomTextNode) => unknown) | null
export type ResolveIDomHtmlNodeType = ((node: IDomHtmlNode, traverse: (node: IDomNode) => unknown) => unknown) | null

type CustomResolversType = {
    resolveIDomTextNode: ResolveIDomTextNodeType
    resolveIDomHtmlNode: ResolveIDomHtmlNodeType
}

export type TransformIDomNodeType = (
    node: IDomNode,
    customResolvers: CustomResolversType
) => unknown;

export const transformToJson = (
    result: IOutputResult,
    customResolvers?: CustomResolversType
) => {
    if (!customResolvers) {
        return result.children
    }

    return result.children.map(node => transformIDomNode(node, customResolvers))
}

const nodeIdentity = (node: IDomNode) => node

const transformIDomNode: TransformIDomNodeType = (
    node: IDomNode,
    customResolvers: CustomResolversType
) => {
    const {resolveIDomHtmlNode, resolveIDomTextNode} = customResolvers;
    if (isText(node)) {
        return resolveIDomTextNode ? resolveIDomTextNode(node) : nodeIdentity(node);
    }
    return resolveIDomHtmlNode ? resolveIDomHtmlNode(node, (node) => transformIDomNode(node, customResolvers)) : nodeIdentity(node)
} 
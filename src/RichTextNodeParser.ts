import { IDomHtmlNode, IDomNode, IDomTextNode } from "./IDomNode";
import { IParser } from "./IParser";
import { NodeParser } from "./utils/NodeParser";
import { IParseResult } from "./utils/parser-utils";
import { Node, NodeType, HTMLElement, TextNode } from "node-html-parser";


export class RichTextNodeParser implements IParser<string> {
    private readonly _parser: NodeParser;
    constructor() {
        this._parser = new NodeParser();
    }

    private isRootNode = (domNode: Node): domNode is HTMLElement =>
    domNode.nodeType === NodeType.ELEMENT_NODE && !domNode.parentNode

    private isTextNode = (domNode: Node): domNode is TextNode =>
        domNode.nodeType === NodeType.TEXT_NODE

    private isElementNode = (domNode: Node): domNode is HTMLElement =>
        domNode.nodeType === NodeType.ELEMENT_NODE

    parse(value: string): IParseResult {
        const node = this._parser.parse(value);

        if (this.isRootNode(node)) {
            return {
                children: node.childNodes.flatMap((node) => this.parseInternal(node))
            }
        }

        else {
            throw new Error();
        }
    }

    private parseInternal(node: Node): IDomNode[] {
        const parsedNodes: IDomNode[] = [];

        if (this.isElementNode(node)) {
            const htmlNode: IDomHtmlNode = {
                tagName: node.tagName.toLowerCase(),
                attributes: node.attributes,
                children: node.childNodes ? node.childNodes.flatMap((childNode: Node) => this.parseInternal(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (this.isTextNode(node)) {
            const textNode: IDomTextNode = {
                content: node.text ?? '',
                type: 'text'
            }

            parsedNodes.push(textNode);
        }

        return parsedNodes;
    }
}
import { IDomHtmlNode, IDomNode, IDomTextNode, IParser, IParseResult } from "../parser-models";
import { NodeParser } from "./NodeParser";
import { Node } from "node-html-parser";
import { isElementNode, isRootNode, isTextNode } from "../../utils/rich-text-node-parser-utils";

export class RichTextNodeParser implements IParser<string> {
    private readonly _parser: NodeParser;

    constructor() {
        this._parser = new NodeParser();
    }

    parse(value: string): IParseResult {
        const node = this._parser.parse(value);

        if (isRootNode(node)) {
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

        if (isElementNode(node)) {
            const htmlNode: IDomHtmlNode = {
                tagName: node.tagName.toLowerCase(),
                attributes: node.attributes,
                children: node.childNodes ? node.childNodes.flatMap((childNode: Node) => this.parseInternal(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (isTextNode(node)) {
            const textNode: IDomTextNode = {
                content: node.text ?? '',
                type: 'text'
            }

            parsedNodes.push(textNode);
        }

        return parsedNodes;
    }
}
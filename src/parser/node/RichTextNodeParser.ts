import { IDomHtmlNode, IDomNode, IDomTextNode, IParserEngine, IOutputResult, IRichTextParser } from "../../parser";
import { NodeParser } from "./NodeParser";
import { Node } from "node-html-parser";
import { isElementNode, isRootNode, isTextNode } from "../../utils/rich-text-node-parser-utils";

export class RichTextNodeParser implements IRichTextParser<string, IOutputResult>  {
    private readonly _parserEngine: IParserEngine;

    constructor() {
        this._parserEngine = new NodeParser();
    }

    parse(input: string): IOutputResult {
        const node = this._parserEngine.parse(input);

        if (isRootNode(node)) {
            return {
                childNodes: node.childNodes.flatMap((node) => this.parseInternal(node))
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
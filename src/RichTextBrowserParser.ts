import { IDomHtmlNode, IDomNode, IDomTextNode } from "./IDomNode";
import { IParser } from "./IParser";

type IParseResult = {
    children: IDomNode[]
}

enum NodeType {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    DOCUMENT_NODE = 9
}



export class RichTextBrowserParser implements IParser<string> {
    private readonly _parser: DOMParser;
    private isRootNode = (domNode: Node): domNode is Document =>
        domNode.nodeType === NodeType.DOCUMENT_NODE
    private isTextNode = (domNode: Node): domNode is Text =>
        domNode.nodeType === NodeType.TEXT_NODE
    private isElementNode = (domNode: Node): domNode is Element =>
        domNode.nodeType === NodeType.ELEMENT_NODE

    private convertDomNodeAttributes = (domNodeAttributes: NamedNodeMap): { [key: string]: string } => {
        let convertedAttributes: { [key: string]: string } = {};

        for (const attr of domNodeAttributes) {
            convertedAttributes[attr.name] = attr.value;
        }

        return convertedAttributes;
    }

    constructor() {
        this._parser = new DOMParser();
    }


    parse(value: string): IParseResult {
        const document = this._parser.parseFromString(value, 'text/html');

        if (this.isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.childNodes).flatMap((node) => this.parseInternal(node))
            }

        }
        else {
            throw new Error();
        }
    }

    private parseInternal(document: Node): IDomNode[] {
        const parsedNodes: IDomNode[] = [];

        if (this.isElementNode(document)) {
            const htmlNode: IDomHtmlNode = {
                tagName: document.tagName.toLowerCase(),
                attributes: document.hasAttributes() ? this.convertDomNodeAttributes(document.attributes) : {},
                children: document.hasChildNodes() ? Array.from(document.childNodes).flatMap((childNode: Node) => this.parseInternal(childNode)) : [],
                type: 'tag'
            }

            parsedNodes.push(htmlNode);
        }

        else if (this.isTextNode(document)) {
            let textNode: IDomTextNode = {
                content: document.nodeValue ?? '',
                type: 'text'
            }

            parsedNodes.push(textNode);
        }

        return parsedNodes;
    }
}
import { Elements } from "@kontent-ai/delivery-sdk";
import { IResolverInput } from "./models/resolver-models";
import { IParserNode } from "./models/parser-models";
import { isElement, isLinkedItem, isText, isUnPairedElement } from "./utils/resolverUtils";
import { RichTextBaseResolver } from "./RichTextBaseResolver";

export class RichTextObjectResolver extends RichTextBaseResolver<any> {
    constructor(input: IResolverInput<any>) {
        super(input);
    }

    private resolveNode(node: (IParserNode | any), element: Elements.RichTextElement): any {
        let resolvedObject: (any | IParserNode) = [];

        if (isText(node)) {
            
        }

        else if (isUnPairedElement(node)) {
            
        }

        else if (isLinkedItem(node) && this._contentItemResolver) {

        }

        else if (isElement(node)) {
            if (node.children.length > 0) {
                node.children.forEach((node) => (this.resolveNode(node, element)))
            }
        }

        return node;
    }

    private resolveNodesRecursively(nodes: (IParserNode[] | any), element: Elements.RichTextElement): any {
        nodes.forEach((node) => {
            if (isLinkedItem(node) && this._contentItemResolver) {
                let currentItemCodename = node.attributes['data-codename'];
                let currentItem = element.linkedItems.find(item => item.system.codename === currentItemCodename);
                let index = nodes.findIndex(node => node);
                nodes[index] = this._contentItemResolver(currentItemCodename, currentItem).resolvedContent;
            }

            else if (isElement(node)) {
                if (node.children.length > 0) {
                    this.resolveNodesRecursively(node.children, element);
                }
            }
        })

        return nodes;
    }

    resolve(element: Elements.RichTextElement): any {
        let parsedTree = this._parser.transform(this._parser.parse(element));      
        parsedTree.content = this.resolveNodesRecursively(parsedTree.content, element);

        return parsedTree.content;
    }
}
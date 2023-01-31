import { Elements } from "@kontent-ai/delivery-sdk";
import { IResolverInput } from "../models/resolver-models";
import { IParserNode } from "../models/parser-models";
import { RichTextBaseResolver } from "./RichTextBaseResolver";

export class RichTextJsonResolver extends RichTextBaseResolver<any> {
    constructor(input: IResolverInput<any>) {
        super(input);
    }

    // TODO

    private resolveNode(node: IParserNode, element: Elements.RichTextElement): any {
        let resolvedJson: any = {};
    }

    resolve(element: Elements.RichTextElement): any {
        let parsedTree = this._parser.parse(element);
        return parsedTree.content.map((node) => this.resolveNode(node, element));
    }
}
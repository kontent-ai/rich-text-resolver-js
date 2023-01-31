import { IHtmlNode } from "../src_old/models/parser-models";
import { IDomHtmlNode, IDomNode, IDomTextNode } from "./IDomNode";
import { IOutputResult, IResolver } from "./IResolver";
import { IRichTextInput } from "./IRichTextInput";
import { RichTextBrowserParser } from "./RichTextBrowserParser";



export class RichTextResolver<TOutput> implements IResolver<IRichTextInput, TOutput> {
    private _parser: RichTextBrowserParser;

    constructor() {
        this._parser = new RichTextBrowserParser();
    }

    async resolveAsync(input: IRichTextInput, resolvers: { resolveDomNode(domNode: IDomNode): Promise<IOutputResult<TOutput>>; }) {
        const parseResult = this._parser.parse(input.value);

        const resolvedObject: IOutputResult<TOutput> = {
            nodes: await Promise.all(parseResult.children.map((childNode) => this.resolveAsyncInternal(childNode)))
        };

        return resolvedObject;

    }

    private async resolveAsyncInternal(node: IDomNode): Promise<TOutput> {
        
        // resolition
        const elementNode = node as IDomHtmlNode;
        if(elementNode){
            const subResult = elementNode.children.map(async (childNode) => await this.resolveAsyncInternal(childNode))
        }

        const textNode = node as IDomTextNode;
        if(textNode) {
            const subResult = this.resolveAsyncInternal(textNode);
        }
        return new Promise(() => null);
    }  
}
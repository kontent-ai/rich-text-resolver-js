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

    // TODO Extract resolver types to separate definition
    async resolveAsync(input: IRichTextInput, resolvers: { resolveDomNode: (domNode: IDomNode) => Promise<TOutput> })
    : Promise<IOutputResult<TOutput>> {
        const parseResult = this._parser.parse(input.value);

        const resolvedChildren = await Promise.all(parseResult.children.flatMap((childNode) => this.resolveAsyncInternal(childNode, resolvers)));

        const result: IOutputResult<TOutput> = {
            childrenNodes: parseResult.children,
            currentNode: null, // root
            currentResolvedNode: null, // root
            childrenResolvedNodes: resolvedChildren
        };

        return result;
    }

    private async resolveAsyncInternal(node: IDomNode, resolvers: { resolveDomNode(domNode: IDomNode): Promise<TOutput>; }): Promise<IOutputResult<TOutput>> {

        const elementNode = node as IDomHtmlNode;
        if (elementNode) {
            const resolvedChildren = await Promise.all(elementNode.children.flatMap((childNode) => this.resolveAsyncInternal(childNode, resolvers)));

            const subResult: IOutputResult<TOutput> = {
                childrenNodes: elementNode.children,
                currentNode: node,
                currentResolvedNode: await resolvers.resolveDomNode(elementNode),
                childrenResolvedNodes: resolvedChildren
            };

            return subResult;
        }

        const textNode = node as IDomTextNode;
        if (textNode) {
            const subResult: IOutputResult<TOutput> = {
                childrenNodes: [], // TODO null ? 
                currentNode: node,
                currentResolvedNode: await resolvers.resolveDomNode(elementNode),
                childrenResolvedNodes: [] // TODO null ? 
            };
        }
        return new Promise(() => null);
    }
}
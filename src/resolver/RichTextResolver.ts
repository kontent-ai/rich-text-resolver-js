import { IParserEngine, IDomNode } from "../parser/parser-models";
import { IOutputResult, IResolver, IResolverMethods, RichTextInput } from "./resolver-models";
import { RichTextBrowserParser } from "../parser/browser/RichTextBrowserParser";

export class RichTextResolver<TOutput> implements IResolver<RichTextInput, TOutput> {
    private _parser: IParserEngine;

    constructor(nodeParser?: IParserEngine) {
        this._parser = nodeParser ? nodeParser : new RichTextBrowserParser();
    }

    // TODO Extract resolver types to separate definition, decide if using only one resolution method is viable
    async resolveAsync(input: RichTextInput, resolvers?: IResolverMethods<TOutput>)
        : Promise<IOutputResult<TOutput>> {
        const parseResult = this._parser.parse(input.value);

        const resolvedChildren = await Promise.all(parseResult.children.flatMap((childNode: IDomNode) => this.resolveAsyncInternal(childNode, resolvers)));

        const result: IOutputResult<TOutput> = {
            childNodes: parseResult.children,
            currentNode: null, // root
            currentResolvedNode: null, // root
            childResolvedNodes: resolvedChildren
        };

        return result;
    }

    private async resolveAsyncInternal(node: IDomNode, resolvers?: IResolverMethods<TOutput>): Promise<IOutputResult<TOutput>> {

        if (node.type === 'tag') {
            const resolvedChildren = await Promise.all(node.children.flatMap((childNode) => this.resolveAsyncInternal(childNode, resolvers)));

            const subResult: IOutputResult<TOutput> = {
                childNodes: node.children,
                currentNode: node,
                currentResolvedNode: resolvers?.resolveDomNode ? await resolvers.resolveDomNode(node) : null,
                childResolvedNodes: resolvedChildren
            };

            return subResult;
        }

        if (node.type === "text") {
            const subResult: IOutputResult<TOutput> = {
                childNodes: [], // TODO null ? 
                currentNode: node,
                currentResolvedNode: resolvers?.resolveDomNode ? await resolvers.resolveDomNode(node) : null,
                childResolvedNodes: [] // TODO null ? 
            };
            return subResult;
        }

        throw new Error("Unidentified state");
    }
}
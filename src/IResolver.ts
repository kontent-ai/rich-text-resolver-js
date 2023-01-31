import { IDomNode } from "./IDomNode";

export interface IOutputResult<TOutput> {
    currentResolvedNode: TOutput | null,
    currentNode: IDomNode | null,
    childrenResolvedNodes: IOutputResult<TOutput>[],
    childrenNodes: IDomNode[]
}

export interface IResolver<TInput, TOutput> {
    resolveAsync(input: TInput, resolvers: {
        resolveDomNode(domNode: IDomNode): Promise<IOutputResult<TOutput>>
    })
}
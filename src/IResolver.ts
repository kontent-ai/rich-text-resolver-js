import { IDomNode } from "./IDomNode";

export interface IOutputResult<TOutput> {
    reolvedNode: TOutput,
    nodes: TOutput[]
}

export interface IResolver<TInput, TOutput> {
    resolveAsync(input: TInput, resolvers: {
        resolveDomNode(domNode: IDomNode): Promise<IOutputResult<TOutput>>
    })
}
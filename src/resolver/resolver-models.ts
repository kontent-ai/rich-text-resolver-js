import { IDomNode } from "../parser/parser-models";

export type RichTextInput = {
    value: string,
    images?: {
        [key: string]: {
            image_id?: string,
            description?: string | null,
            url: string,
            width?: number | undefined,
            height?: number | undefined
        }
    },
    links?: {
        [key: string]: {
            codename: string,
            type?: string,
            url_slug?: string
        }
    },
    modular_content?: string[]
}

export interface IResolverMethods<TOutput> {
    resolveDomNode(domNode: IDomNode): Promise<TOutput>;
}

export interface IOutputResult<TOutput> {
    currentResolvedNode: TOutput | null,
    currentNode: IDomNode | null,
    childResolvedNodes: IOutputResult<TOutput>[],
    childNodes: IDomNode[]
}

export interface IResolver<TInput, TOutput> {
    resolveAsync(input: TInput, resolvers: {
        resolveDomNode(domNode: IDomNode): Promise<TOutput>
    }): Promise<IOutputResult<TOutput>>
}
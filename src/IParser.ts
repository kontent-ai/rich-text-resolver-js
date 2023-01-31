import { IDomNode } from "./IDomNode"

export interface IParser<TInput> {
    parse(value: TInput): {
        children: IDomNode[]
    }
}
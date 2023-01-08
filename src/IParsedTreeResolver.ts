import { IParsedTree } from "./IRichTextToJsonTransformer";

export interface IParsedTreeResolver {
    resolve(parsedTree: IParsedTree): any;
}
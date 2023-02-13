import { IParserEngine, RichTextInput, IOutputResult, IRichTextParser } from "./parser-models";
import { isRootNode } from "../utils/";

export abstract class RichTextBaseParser implements IRichTextParser<RichTextInput, IOutputResult> {
    abstract _parser: IParserEngine;
    abstract parseInternal(node: any): any;

    parse(input: RichTextInput): IOutputResult {
        const node = this._parser.parse(input.value);

        if (isRootNode(node) && node.body.firstChild) {
            throw new Error("Not implemented.")
        }
        else {
            throw new Error();
        }
    }
}
import { IParser, IParseResult, IParserEngine } from "./parser-models";
import { isRootNode } from "../utils/";

export abstract class RichTextBaseParser implements IParser {
    abstract _parser: IParserEngine;
    abstract parseInternal(node: any): any;

    parse(value: string): IParseResult {
        const document = this._parser.parse(value);

        if (isRootNode(document) && document.body.firstChild) {
            return {
                children: Array.from(document.body.childNodes).flatMap((node) => this.parseInternal(node))
            }

        }
        else {
            throw new Error();
        }
    }
}
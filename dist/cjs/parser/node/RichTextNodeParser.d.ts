import { IOutputResult, IRichTextParser } from "../../parser";
export declare class RichTextNodeParser implements IRichTextParser<string, IOutputResult> {
    private readonly _parserEngine;
    constructor();
    parse(input: string): IOutputResult;
    private parseInternal;
}

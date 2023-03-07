import { IOutputResult, IRichTextParser } from "../parser-models";
export declare class RichTextBrowserParser implements IRichTextParser<string, IOutputResult> {
    private readonly _parserEngine;
    constructor();
    parse(input: string): IOutputResult;
    private parseInternal;
}

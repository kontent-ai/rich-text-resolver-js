import { IParserEngine } from "../parser-models";
export declare class BrowserParser implements IParserEngine {
    private _parser;
    constructor();
    parse(html: string): Document;
}

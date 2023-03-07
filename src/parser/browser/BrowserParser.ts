import { IParserEngine } from "../parser-models";

export class BrowserParser implements IParserEngine {
    private _parser: DOMParser;
    constructor() {
        this._parser = new DOMParser();
    }

    parse(html: string): Document { // unified method name for both types of parsers
        return this._parser.parseFromString(html, 'text/html');
    }
}
import { IParserEngine } from "../parser-models";

export class BrowserParser extends DOMParser implements IParserEngine {
    constructor() {
        super();
    }

    parse(html: string): Document { // unified method name for both types of parsers
        return this.parseFromString(html, 'text/html');
    }
}
import { IParserEngine } from "../../models/parser-models";

export class BrowserParser extends DOMParser implements IParserEngine {
    constructor() {
        super();
    }

    parse(html: string): HTMLElement {
        return this.parseFromString(html, 'text/html').body;
    }
}
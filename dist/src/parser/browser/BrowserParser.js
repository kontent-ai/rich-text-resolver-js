export class BrowserParser {
    _parser;
    constructor() {
        this._parser = new DOMParser();
    }
    parse(html) {
        return this._parser.parseFromString(html, 'text/html');
    }
}

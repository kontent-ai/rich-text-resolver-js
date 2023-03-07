export class BrowserParser {
    constructor() {
        this._parser = new DOMParser();
    }
    parse(html) {
        return this._parser.parseFromString(html, 'text/html');
    }
}

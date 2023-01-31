"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserParser = void 0;
class BrowserParser extends DOMParser {
    constructor() {
        super();
    }
    parse(html) {
        return this.parseFromString(html, 'text/html').body;
    }
}
exports.BrowserParser = BrowserParser;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserParser = void 0;
class BrowserParser {
    constructor() {
        this._parser = new DOMParser();
    }
    parse(html) {
        return this._parser.parseFromString(html, 'text/html');
    }
}
exports.BrowserParser = BrowserParser;

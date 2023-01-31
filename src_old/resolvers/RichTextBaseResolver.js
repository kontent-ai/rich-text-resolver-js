"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextBaseResolver = void 0;
const RichTextBrowserParser_1 = require("../parsers/RichTextBrowserParser");
class RichTextBaseResolver {
    constructor(input) {
        var _a;
        this._contentItemResolver = input.contentItemResolver,
            this._urlResolver = input.urlResolver,
            this._imageResolver = input.imageResolver,
            this._parser = (_a = input.parser) !== null && _a !== void 0 ? _a : new RichTextBrowserParser_1.RichTextBrowserParser();
    }
}
exports.RichTextBaseResolver = RichTextBaseResolver;

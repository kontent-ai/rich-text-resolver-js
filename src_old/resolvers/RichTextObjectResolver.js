"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextObjectResolver = void 0;
const RichTextBaseResolver_1 = require("./RichTextBaseResolver");
class RichTextObjectResolver extends RichTextBaseResolver_1.RichTextBaseResolver {
    resolve(input) {
        throw new Error("Method not implemented.");
    }
    //TODO
    constructor(input) {
        super(input);
    }
}
exports.RichTextObjectResolver = RichTextObjectResolver;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextJsonResolver = void 0;
const RichTextBaseResolver_1 = require("./RichTextBaseResolver");
class RichTextJsonResolver extends RichTextBaseResolver_1.RichTextBaseResolver {
    constructor(input) {
        super(input);
    }
    // TODO
    resolveNode(node, element) {
        let resolvedJson = {};
    }
    resolve(element) {
        let parsedTree = this._parser.parse(element);
        return parsedTree.content.map((node) => this.resolveNode(node, element));
    }
}
exports.RichTextJsonResolver = RichTextJsonResolver;

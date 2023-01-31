"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeParser = void 0;
const node_html_parser_1 = require("node-html-parser");
class NodeParser {
    constructor() {
        this.parse = node_html_parser_1.parse;
    }
}
exports.NodeParser = NodeParser;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RichTextResolver = void 0;
const RichTextBrowserParser_1 = require("./RichTextBrowserParser");
class RichTextResolver {
    constructor() {
        this._parser = new RichTextBrowserParser_1.RichTextBrowserParser();
    }
    // TODO Extract resolver types to separate definition
    resolveAsync(input, resolvers) {
        return __awaiter(this, void 0, void 0, function* () {
            const parseResult = this._parser.parse(input.value);
            const resolvedChildren = yield Promise.all(parseResult.children.flatMap((childNode) => this.resolveAsyncInternal(childNode, resolvers)));
            const result = {
                childrenNodes: parseResult.children,
                currentNode: null,
                currentResolvedNode: null,
                childrenResolvedNodes: resolvedChildren
            };
            return result;
        });
    }
    resolveAsyncInternal(node, resolvers) {
        return __awaiter(this, void 0, void 0, function* () {
            const elementNode = node;
            if (elementNode) {
                const resolvedChildren = yield Promise.all(elementNode.children.flatMap((childNode) => this.resolveAsyncInternal(childNode, resolvers)));
                const subResult = {
                    childrenNodes: elementNode.children,
                    currentNode: node,
                    currentResolvedNode: yield resolvers.resolveDomNode(elementNode),
                    childrenResolvedNodes: resolvedChildren
                };
                return subResult;
            }
            const textNode = node;
            if (textNode) {
                const subResult = {
                    childrenNodes: [],
                    currentNode: node,
                    currentResolvedNode: yield resolvers.resolveDomNode(elementNode),
                    childrenResolvedNodes: [] // TODO null ? 
                };
            }
            return new Promise(() => null);
        });
    }
}
exports.RichTextResolver = RichTextResolver;

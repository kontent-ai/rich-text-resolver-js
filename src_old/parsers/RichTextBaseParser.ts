// import { BrowserParser, Elements } from "@kontent-ai/delivery-sdk";
// import { IParsedTree, IParserEngine, IRichTextParser } from "../models/parser-models";
// import { HTMLElement as NodeHTMLElement } from "node-html-parser";
// import { NodeParser } from "./engine/NodeParser";

// export abstract class RichTextBaseParser<T extends HTMLElement | NodeHTMLElement> implements IRichTextParser {
//     protected _parserEngine: IParserEngine<T>;

//     constructor(parserEngine?: IParserEngine<HTMLElement>) {
//         this._parserEngine = parserEngine ?? {};
//     }

//     abstract parse(richTextElement: Elements.RichTextElement): IParsedTree;
// }
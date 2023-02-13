import { IParser } from "../parser/parser-models";
import { IOutputResult, IRichTextParser, RichTextInput } from "./resolver-models";
import { RichTextBrowserParser } from "../parser/browser/RichTextBrowserParser";

export class RichTextParser implements IRichTextParser<RichTextInput, IOutputResult> {
    private _parser: IParser;

    constructor(nodeParser?: IParser) {
        this._parser = nodeParser ? nodeParser : new RichTextBrowserParser();
    }

    parse(input: RichTextInput)
        : IOutputResult {
        const parseResult = this._parser.parse(input.value);
        const result: IOutputResult = {
            childNodes: parseResult.children
        };

        return result;
    }
}
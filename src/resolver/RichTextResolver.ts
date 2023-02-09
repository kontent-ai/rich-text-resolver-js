import { IParser } from "../parser/parser-models";
import { IOutputResult, IResolver, RichTextInput } from "./resolver-models";
import { RichTextBrowserParser } from "../parser/browser/RichTextBrowserParser";

export class RichTextResolver implements IResolver<RichTextInput, IOutputResult> {
    private _parser: IParser;

    constructor(nodeParser?: IParser) {
        this._parser = nodeParser ? nodeParser : new RichTextBrowserParser();
    }

    async resolveAsync(input: RichTextInput)
        : Promise<IOutputResult> {
        const parseResult = this._parser.parse(input.value);
        const result: IOutputResult = {
            childNodes: parseResult.children,
            currentNode: null, // root
        };

        return result;
    }
}
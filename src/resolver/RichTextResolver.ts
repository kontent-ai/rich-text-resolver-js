import { IParserEngine, IDomNode, IParser } from "../parser/parser-models";
import { IOutputResult, IResolver, RichTextInput } from "./resolver-models";
import { RichTextBrowserParser } from "../parser/browser/RichTextBrowserParser";

export class RichTextResolver<TOutput> implements IResolver<RichTextInput, TOutput> {
    private _parser: IParser;

    constructor(nodeParser?: IParser) {
        this._parser = nodeParser ? nodeParser : new RichTextBrowserParser();
    }

    async resolveAsync(input: RichTextInput)
        : Promise<IOutputResult> {
        const parseResult = this._parser.parse(input.value);
            // TODO provide an option to pass linker method and construct the output in the first tree traversal?
        const result: IOutputResult = {
            childNodes: parseResult.children,
            currentNode: null, // root
        };

        return result;
    }
}
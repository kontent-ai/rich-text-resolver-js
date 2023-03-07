import { parse } from 'node-html-parser';
import { IParserEngine } from '../parser-models';

export class NodeParser implements IParserEngine { // class wrapper around parse method from node-html-parser
    parse(html: string) {
        return parse(html);
    }// unify method name
}
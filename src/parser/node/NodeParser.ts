import { parse as nodeParse } from 'node-html-parser';
import { IParserEngine } from '../parser-models';

export class NodeParser implements IParserEngine { // class wrapper around parse method from node-html-parser
    parse = nodeParse // unify method name
}
import * as NodeHtmlParser from 'node-html-parser';
import { IParserEngine } from '../parser-models';

export const NodeParser = { // class wrapper around parse method from node-html-parser
    parse: NodeHtmlParser.parse // unify method name
}
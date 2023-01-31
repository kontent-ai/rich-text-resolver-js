import { parse as nodeParse, HTMLElement as NodeHTMLElement } from 'node-html-parser';
import { IParserEngine } from '../../models/parser-models';

export class NodeParser implements IParserEngine {
    parse = nodeParse
}
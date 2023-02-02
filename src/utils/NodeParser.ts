import { parse as nodeParse, HTMLElement as NodeHTMLElement } from 'node-html-parser';

export class NodeParser { // class wrapper around parse method from node-html-parser
    parse = nodeParse
}
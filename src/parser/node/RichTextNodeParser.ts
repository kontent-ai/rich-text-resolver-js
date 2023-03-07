import { IDomHtmlNode, IDomNode, IDomTextNode, IParserEngine, IOutputResult, IRichTextParser, IPortableTextItem, IPortableTextBlock, IPortableTextSpan } from "../../parser";
import { NodeParser } from "./NodeParser";
import { HTMLElement, Node } from "node-html-parser";
import { isBlock, isElementNode, isLineBreak, isRootNode, isStyleBlock, isTextMark, isTextNode } from "../../utils/rich-text-node-parser-utils";
import { createBlock, createSpan, isElement, isText, ProcessedUnit } from "../../utils/parser-utils";

export class RichTextNodeParser implements IRichTextParser<string, IPortableTextItem[]>  {
    private readonly _parserEngine: IParserEngine;

    constructor() {
        this._parserEngine = new NodeParser();
    }

    parse(input: string): IPortableTextItem[] {
        // const node = this._parserEngine.parse(input);
        const node = this._parserEngine.parse(input);
        if (isRootNode(node)) {
            return node.childNodes.flatMap((node) => this.parseInternal(node))
        }

        else {
            throw new Error();
        }
        // if (isRootNode(node)) {
        //     return {
        //         children: node.childNodes.flatMap((node) => this.parseInternal(node))
        //     }
        // }

        // else {
        //     throw new Error();
        // }
    }

    // private processedSpans: IPortableTextSpan[]  = [];
    // private processedBlocks: IPortableTextBlock[] = [];

    // private finishedBlocks: IPortableTextBlock[]  = [];

    private parseInternal(
        node: Node, 
        processedUnit?: IPortableTextBlock | IPortableTextSpan
        )
        : 
        IPortableTextItem[] {
            
        let finishedBlocks: IPortableTextItem[] = [];

        // let currentBlockIndex = parsedBlocks.findIndex(block => block._key === this.currentBlockKey);
        // let currentSpanIndex = parsedBlocks[currentBlockIndex].children.findIndex(span => span._key === this.currentSpanKey);
 

        if(processedUnit) {
            switch(processedUnit._type) {
                case('block'): {
                    if(isElementNode(node)) {
                        if(isStyleBlock(node)) {
                            finishedBlocks.push(processedUnit);
                            processedUnit = createBlock("test", [], node.tagName.toLowerCase());
                            node.childNodes.flatMap(node => this.parseInternal(node, processedUnit));
                        }

                        else if(isTextMark(node)) {
                            finishedBlocks.push(processedUnit);
                            processedUnit = createSpan("test", [node.tagName.toLowerCase()])
                            node.childNodes.flatMap(node => this.parseInternal(node, processedUnit));
                        }
                        //TODO: link
                        else if(isLineBreak(node)) {
                            finishedBlocks.push(processedUnit);
                            processedUnit = createSpan("test", [], '\\n');
                            (<IPortableTextBlock>finishedBlocks[finishedBlocks.length - 1]).children.push(processedUnit);
                        }
                        else {
                            finishedBlocks.push(processedUnit);
                            processedUnit = createBlock("test");
                            node.childNodes.flatMap(node => this.parseInternal(node, processedUnit));
                        }

                    }

                    else if(isTextNode(node)) {
                        finishedBlocks.push(processedUnit);
                        processedUnit = createSpan("test", [], node.text);
                        (<IPortableTextBlock>finishedBlocks[finishedBlocks.length - 1]).children.push(processedUnit);
                    }

                    
                }
                default: {}

            }
        }

        else {
            processedUnit = createBlock("test", [], 'normal');
            finishedBlocks.push(processedUnit);
            node.childNodes.flatMap(node => this.parseInternal(node, processedUnit));
        }

        return finishedBlocks;
            // processedSpans.push(createSpan("test"));
            // while(isElementNode(node) && isStyledNode(node)) {               
            //     processedSpans[processedSpans.length - 1].marks.push(node.tagName.toLowerCase());
            //     node = node.firstChild;
            // }

            // parsedBlocks.push(createBlock("test"));
        






        // if (isElementNode(node)) {
        //     const htmlNode: IDomHtmlNode = {
        //         tagName: node.tagName.toLowerCase(),
        //         attributes: node.attributes,
        //         children: node.childNodes ? node.childNodes.flatMap((childNode: Node) => this.parseInternal(childNode)) : [],
        //         type: 'tag'
        //     }

        //     parsedNodes.push(htmlNode);
        // }

        // else if (isTextNode(node)) {
        //     const textNode: IDomTextNode = {
        //         content: node.text ?? '',
        //         type: 'text'
        //     }

        //     parsedNodes.push(textNode);
        // }

        // return parsedNodes;
    }
}
import { IParserEngine, IRichTextParser, IPortableTextItem, IBlockBuffer, IPortableTextMarkDef, IReference } from "../../parser";
import { NodeParser } from "./NodeParser";
import { HTMLElement, Node } from "node-html-parser";
import { isElementNode, isExternalLink, isFigure, isIgnoredElement, isImage, isInternalLink, isLineBreak, isLinkedItem, isListBlock, isListItem, isRootNode, isStyleBlock, isTable, isTableCell, isTextMark, isTextNode } from "../../utils/rich-text-node-parser-utils";
import { createBlock, createComponentBlock, createImageBlock, createListBlock, createSpan, createTableBlock } from "../../utils/parser-utils";
import crypto from 'crypto';

export class RichTextNodeParser implements IRichTextParser<string, IPortableTextItem[]>  {
    private readonly _parserEngine: IParserEngine;

    constructor() {
        this._parserEngine = new NodeParser();
    }

    parse(input: string): IPortableTextItem[] {
        const node = this._parserEngine.parse(input.replaceAll('\n', ''));
        if (isRootNode(node)) {
            return node.childNodes.flatMap((node) => this.parseInternal(node))
        }

        else {
            throw new Error();
        }
    }

    private parseInternal(node: Node, buffer?: IBlockBuffer): IPortableTextItem[] {
        if(buffer?.element) {
            if(isElementNode(node)) {
                if(isTextMark(node)) {
                    buffer.marks.push(node.rawTagName);
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if(isLineBreak(node)) {
                    const span = createSpan(crypto.randomUUID(), [], '\n');
                    if('children' in buffer.element) {
                        buffer.element.children.push(span);
                    }                  
                    buffer.finishedBlocks.push(buffer.element);
                }

                else if(isListBlock(node)) {
                    if('listItem' in buffer.element) {
                        buffer.listLevel++;
                    }
                    buffer.listType = node.rawTagName === 'ul' ? 'bullet' : 'number';
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if(isListItem(node)) {
                    buffer.element = createListBlock(
                        crypto.randomUUID(), 
                        buffer.listLevel, 
                        buffer.listType!
                    )

                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if(isFigure(node)) {
                    buffer.element = createImageBlock(crypto.randomUUID());
                    buffer.element.asset._ref = node.attributes['data-image-id'];

                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if (isImage(node)) {
                    if('asset' in buffer.element) {
                        buffer.element.asset!.url = node.attributes['src'];
                    }

                    buffer.finishedBlocks.push(buffer.element);
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if(isInternalLink(node)) {
                    const markDef: IPortableTextMarkDef = {
                        _type: 'internalLink',
                        _key: crypto.randomUUID(),
                        reference: {
                            _type: 'reference',
                            _ref: node.attributes['data-item-id']
                        }
                    }
                    buffer.marks.push(markDef._key);
                    if('markDefs' in buffer.element) {
                        buffer.element.markDefs.push(markDef);
                    }
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if(isExternalLink(node)) {
                    const markDef: IPortableTextMarkDef = {
                        _type: "link",
                        _key: crypto.randomUUID(),
                        ...node.attributes
                    }
                    buffer.marks.push(markDef._key);
                    if('markDefs' in buffer.element) {
                        buffer.element.markDefs.push(markDef);
                    }
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if(isLinkedItem(node)) {
                    const itemReference: IReference = {
                        _type: "reference",
                        _ref: node.attributes['data-codename']
                    }
                    buffer.element = createComponentBlock(crypto.randomUUID(), itemReference);
                    buffer.finishedBlocks.push(buffer.element);
                }

                else if(isIgnoredElement(node)) {
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else {
                    buffer.element = createBlock(crypto.randomUUID(), [], isStyleBlock(<HTMLElement>node) ? (<HTMLElement>node).rawTagName : "normal");
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }
            }

            else if(isTextNode(node)) {
                const span = createSpan(crypto.randomUUID(), buffer.marks, node.text);
                if('children' in buffer.element) {
                    buffer.element.children.push(span);
                }               
                buffer.finishedBlocks.push(buffer.element);
                buffer.marks = [];
            }
            
        }

        else {
            if(isElementNode(node)) {
                if(isStyleBlock(node)) {
                    buffer = {
                        element: createBlock(crypto.randomUUID(), [], (node).rawTagName),
                        finishedBlocks: [],
                        marks: [],
                        listLevel: 1
                    }

                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                else if (isFigure(node)) {
                    buffer = {
                        marks: [],
                        finishedBlocks: [],
                        listLevel: 1,
                        element: createImageBlock(crypto.randomUUID())
                    }
                    if('asset' in buffer.element!) {
                        buffer.element!.asset!._ref = node.attributes['data-image-id'];
                    }

                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }
    
                else if(isListBlock(node)) {
                    buffer = {
                        marks: [],
                        finishedBlocks: [],
                        listLevel: 1,
                        listType: node.rawTagName === 'ul' ? 'bullet' : 'number',
                    }
    
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }
    
                else if(isListItem(node)) {
                    buffer!.element = createListBlock(
                        crypto.randomUUID(),
                        buffer!.listLevel,
                        buffer!.listType!
                    )

                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }

                // else if(isTableCell(node)) {
                //     if(node.firstChild.nodeType === 3) {
                //         buffer!.element = createBlock(crypto.randomUUID());
                //     }
                //     node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                // }
                else if(isLinkedItem(node)) {
                    const itemReference: IReference = {
                        _type: "reference",
                        _ref: node.attributes['data-codename']
                    }

                    buffer = {
                        element: createComponentBlock(crypto.randomUUID(), itemReference),
                        listLevel: 1,
                        marks: [],
                        finishedBlocks: []
                    }

                    buffer.finishedBlocks.push(buffer.element!);
                }

                else if(isIgnoredElement(node)) {
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }
    
                else {
                    buffer = {
                        finishedBlocks: [],
                        element: createBlock(crypto.randomUUID(), [], 'normal'),
                        marks: [],
                        listLevel: 1
                    }
                    //buffer.finishedBlocks.push(<IPortableTextBlock>(buffer.element));
                    node.childNodes.flatMap(node => this.parseInternal(node, buffer));
                }
            }
        }

        return buffer!.finishedBlocks;
    }
}
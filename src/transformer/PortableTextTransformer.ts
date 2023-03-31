import { IDomHtmlNode, IDomNode, IDomTextNode, IOutputResult, IPortableTextBlock, IPortableTextImage, IPortableTextInternalLink, IPortableTextItem, IPortableTextListBlock, IPortableTextStyleMark, IPortableTextMarkDef, IPortableTextParagraph, IPortableTextSpan, IPortableTextMark, IListBuffer } from "../parser"
import { createBlock, createExternalLink, createImageBlock, createItemLink, createListBlock, createMark, createSpan, isBlock, isExternalLink, isImage, isItemLink, isLineBreak, isListItem, isOrderedListBlock, isParagraph, isSpan, isTextMark, isUnorderedListBlock } from "../utils";
import crypto from 'crypto';

export const transform = (flattenedBlocks: IPortableTextItem[]): IPortableTextItem[] => {
    const result = flattenedBlocks.reduce<IPortableTextItem[]>((acc, val) => {
        const previous = acc.pop();
        if(isBlock(previous)) {
            switch (val._type) {
                case 'span':
                    previous.children.push(<IPortableTextSpan>val);
                    acc.push(previous);
                    break;

                case 'block':
                    acc.push(previous);
                    acc.push(val);
            
                default:
                    break;
            }
            return acc;
        }

        else if(isSpan(previous)) {
            switch (val._type) {
                
            }
        }

        else {
            acc.push(val);
        }

        return acc;
    },[])

    return result;
}

export const mergeSpansAndMarks = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    let marks: string[] = [];
    let links: string[] = [];

    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item) => {
        if(item._type === 'mark') {
            marks.push(item.value);
        }
        else if(item._type === 'linkMark') {
            links.push(item.value);
        }
        else if(item._type === 'internalLink' || item._type === 'link') { // TODO don't pop if it's not a block
            const previousBlock = mergedItems.pop() as IPortableTextParagraph || createBlock(crypto.randomUUID()); //create new block if no previous exists
            previousBlock.markDefs.push(item); // TODO link mark must persist across multiple spans if each has its own formatting
            mergedItems.push(previousBlock);
        }
        else if(item._type === 'span') {
            item.marks = [...marks, ...links];
            mergedItems.push(item);
            marks = [];
        }
        else {
            links = [];
            mergedItems.push(item);
        }

        return mergedItems;
    },[])

    return mergedItems;
}

export const mergeBlocksAndSpans = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item, index) => {
        if (item._type === 'block') {
            mergedItems.push(item);
        }

        else if (item._type === 'span') {
            const previousBlock = mergedItems.pop() as IPortableTextParagraph;
            previousBlock.children.push(item);
            mergedItems.push(previousBlock);
        }

        return mergedItems;
    },[])

    return mergedItems;
}

const listBuffer: IListBuffer = {
    level: 1,
    type: 'number',
    isNested: false
}

const compose = <T>(firstFunction: (argument: T) => T, ...functions: Array<(argument: T) => T>) =>
    functions.reduce((previousFunction, nextFunction) => value => previousFunction(nextFunction(value)), firstFunction);

export const mergeAllItems = compose(mergeBlocksAndSpans, mergeSpansAndMarks);

export const flatten = (finishedBlocks: IPortableTextItem[], node: IDomNode, index: number): IPortableTextItem[] => {
    switch (node.type) {
        case 'tag':
            finishedBlocks.push(...getElementTransformer(node, listBuffer));
            node.children.reduce(flatten, finishedBlocks);
            break;
        
        case 'text': {
            finishedBlocks.push(transformText(node));
            break;
        }

        default:
            throw new Error("Input is not a valid HTML node or text node.");
    }

    return finishedBlocks;
}

const checkForNestedList = (node: IDomHtmlNode): boolean => {
    const nestedList = node.children.find(node => node.type === 'tag' && ['ol','ul'].includes(node.tagName));
    if(nestedList) return true
    else return false
}

const getElementTransformer = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    if (isParagraph(node)) {
        return [transformBlock(node)]
    }

    if (isTextMark(node)) {
        return [transformTextMark(node)]
    }

    if (isUnorderedListBlock(node)) {
        if(listBuffer.isNested)
            listBuffer.level++;
        listBuffer.isNested = checkForNestedList(node);
        listBuffer.type = 'bullet';
        return [];
    }

    if (isOrderedListBlock(node)) {
        if(listBuffer.isNested)
            listBuffer.level++;
        listBuffer.isNested = checkForNestedList(node);
        listBuffer.type = 'number';
        return []
    }

    if (isItemLink(node)) {
        return transformInternalLink(node);
    }

    if (isExternalLink(node)) {
        return transformExternalLink(node);
    }

    if (isListItem(node)) {
        return [transformListItem(node)];
    }

    if (isLineBreak(node)) {
        return [transformLineBreak()];
    }

    if (isImage(node)) {
        return [transformImage(node)];
    }

    throw new Error(`No renderer exists for HTML tag: ${node.tagName}`);
}

const transformListBlock = (node: IDomHtmlNode, listLevel: number): void => {
    // const block = createListBlock(
    //     crypto.randomUUID(), 
    //     listLevel,
    //     node.tagName === 'ul' ? 'bullet' : 'number'
    // )

    // return block;
    return;
}

const transformTextMark = (node: IDomHtmlNode): IPortableTextMark => {
    const span = createMark(crypto.randomUUID(), node.tagName, 'mark');

    return span;
}

const transformLineBreak = (): IPortableTextSpan => {
    const span = createSpan(crypto.randomUUID(), [], '\n')

    return span;
}

const transformListItem = (node: IDomHtmlNode): IPortableTextListBlock => {
    const listBlock = createListBlock(crypto.randomUUID(), listBuffer.level, listBuffer.type);

    return listBlock;
}

const transformImage = (node: IDomHtmlNode): IPortableTextImage => {
    const block = createImageBlock(crypto.randomUUID());
    const imageTag = node.children[0] as IDomHtmlNode;

    block.asset._ref = node.attributes['data-image-id'];
    block.asset.url = imageTag.attributes['src'];
    
    return block;
}

const transformInternalLink = (node: IDomHtmlNode): IPortableTextItem[] => {
    const link = createItemLink(crypto.randomUUID(), node.attributes['data-item-id']);
    const mark = createMark(crypto.randomUUID(), link._key, 'linkMark');

    return [link, mark];
}

const transformExternalLink = (node: IDomHtmlNode): IPortableTextItem[] => {
    const link = createExternalLink(crypto.randomUUID(), node.attributes)
    const mark = createMark(crypto.randomUUID(), link._key, "linkMark");

    return [link, mark];
}

const transformText = (node: IDomTextNode): IPortableTextSpan => {
    const span = createSpan(crypto.randomUUID(), [], node.content);

    return span;
}

const transformBlock = (node: IDomHtmlNode): IPortableTextBlock => {
    const block = createBlock(crypto.randomUUID());

    return block;
}
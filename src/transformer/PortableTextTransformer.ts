import { IDomHtmlNode, IDomNode, IDomTextNode, IOutputResult, IPortableTextBlock, IPortableTextImage, IPortableTextInternalLink, IPortableTextItem, IPortableTextListBlock, IPortableTextStyleMark, IPortableTextMarkDef, IPortableTextParagraph, IPortableTextSpan, IPortableTextMark, IListBuffer, IPortableTextTable, IPortableTextTableRow } from "../parser"
import { createBlock, createExternalLink, createImageBlock, createItemLink, createListBlock, createMark, createSpan, createTable, createTableCell, createTableRow, isBlock, isExternalLink, isImage, isItemLink, isLineBreak, isListBlock, isListItem, isOrderedListBlock, isParagraph, isSpan, isTable, isTableCell, isTableRow, isText, isTextMark, isUnorderedListBlock } from "../utils";
import crypto from 'crypto';

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
            previousBlock.markDefs.push(item);
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
        if (item._type === 'span') {
            const previousBlock = mergedItems.pop() as IPortableTextParagraph;
            previousBlock.children.push(item);
            mergedItems.push(previousBlock);
        } else {
            mergedItems.push(item);
        }
        return mergedItems;
    },[])

    return mergedItems;
}

const mergeTablesAndRows = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item, index) => {
        if (item._type === 'row') {
            const tableBlock = mergedItems.pop() as IPortableTextTable;
            tableBlock.rows.push(item);
            mergedItems.push(tableBlock);
        } else {
            mergedItems.push(item);
        }


        return mergedItems;
    },[])

    return mergedItems;
}

const mergeRowsAndCells = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item) => {
        if (item._type === 'cell') {
            const tableRow = mergedItems.pop() as IPortableTextTableRow;
            tableRow.cells.push(item);
            mergedItems.push(tableRow);
        } else {
            mergedItems.push(item);
        }

        return mergedItems;
    },[])

    return mergedItems;
}

const mergeCellsAndBlocks = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item, index, array) => {
        if (item._type === 'cell') {
            for(let i = 0; i < item.childBlocksCount; i++) {
                item.content.push(array[index + i] as IPortableTextBlock);
                array.splice(index + i, 1);
            }
            mergedItems.push(item);
        } else {
            mergedItems.push(item);
        }

        return mergedItems;
    },[])

    return mergedItems;
}

const compose = <T>(firstFunction: (argument: T) => T, ...functions: Array<(argument: T) => T>) =>
    functions.reduce((previousFunction, nextFunction) => value => previousFunction(nextFunction(value)), firstFunction);

export const mergeAllItems = compose(mergeTablesAndRows, mergeRowsAndCells, mergeCellsAndBlocks, mergeBlocksAndSpans, mergeSpansAndMarks);

export const flatten = (parseResult: IOutputResult): IPortableTextItem[] => {
    const listBuffer: IListBuffer = {
        level: 0,
        type: 'number',
        isNested: false
    }

    return parseResult.children.flatMap(node => transformNode(node, listBuffer));
}

const transformNode = (node: IDomNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    if(isText(node)) {
        return [transformText(node)]
    } else {
        return transformElement(node, listBuffer);
    }
}

const transformElement = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    if (isParagraph(node)) {
        return transformBlock(node, listBuffer)
    }

    if (isTextMark(node)) {
        return transformTextMark(node, listBuffer)
    }

    if (isListBlock(node)) {
        return transformListBlock(node, listBuffer);
    }

    if (isItemLink(node)) {
        return transformInternalLink(node, listBuffer);
    }

    if (isExternalLink(node)) {
        return transformExternalLink(node, listBuffer);
    }

    if (isListItem(node)) {
        return transformListItem(node, listBuffer);
    }

    if (isLineBreak(node)) {
        return [transformLineBreak()];
    }

    if (isImage(node)) {
        return [transformImage(node)];
    }

    if (isTable(node)) {
        return transformTable(node, listBuffer);
    }

    if (isTableRow(node)) {
        return transformTableRow(node, listBuffer);
    }

    if (isTableCell(node)) {
        return transformTableCell(node, listBuffer);
    }

    throw new Error(`No renderer exists for HTML tag: ${node.tagName}`);
}

const transformListBlock = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const tempBuffer = listBuffer;
    tempBuffer.type = node.tagName === 'ol' ? 'number' : 'bullet';
    tempBuffer.level++;

    const transformedSubtree = node.children.flatMap(node => transformListItem(<IDomHtmlNode>node, tempBuffer));

    return transformedSubtree;
}

const transformTextMark = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const transformedSubtree: IPortableTextItem[] = [createMark(crypto.randomUUID(), node.tagName, 'mark')];
    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))

    return transformedSubtree;
}

const transformLineBreak = (): IPortableTextSpan => {
    const span = createSpan(crypto.randomUUID(), [], '\n')

    return span;
}

const transformListItem = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const transformedSubtree: IPortableTextItem[] = [createListBlock(crypto.randomUUID(), listBuffer.level, listBuffer.type)];
    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))
    
    return transformedSubtree;
}

const transformImage = (node: IDomHtmlNode): IPortableTextImage => {
    const block = createImageBlock(crypto.randomUUID());
    const imageTag = node.children[0] as IDomHtmlNode;

    block.asset._ref = node.attributes['data-image-id'];
    block.asset.url = imageTag.attributes['src'];
    
    return block;
}

const transformInternalLink = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const link = createItemLink(crypto.randomUUID(), node.attributes['data-item-id']);
    const mark = createMark(crypto.randomUUID(), link._key, 'linkMark');
    const transformedSubtree: IPortableTextItem[] = [link, mark];

    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))

    return transformedSubtree;
}

const transformTable = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const tableBody = node.children[0] as IDomHtmlNode;
    const tableRow = tableBody.children[0] as IDomHtmlNode;
    const numCols = tableRow.children.length;
    const transformedSubtree: IPortableTextItem[] = [createTable(crypto.randomUUID(), numCols)];

    tableBody.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)));

    return transformedSubtree;
}

const transformTableRow = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const transformedSubtree: IPortableTextItem[] = [createTableRow(crypto.randomUUID())];

    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))

    return transformedSubtree;
}

const transformTableCell = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const transformedSubtree: IPortableTextItem[] = [createTableCell(crypto.randomUUID(), node.children.length)];
    if(node.children[0].type !== 'tag' || node.children[0].tagName === 'br')
        transformedSubtree.push(createBlock(crypto.randomUUID())); // because of cell/paragraph inconsistency
    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))

    return transformedSubtree;
}
 
const transformExternalLink = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const link = createExternalLink(crypto.randomUUID(), node.attributes);
    const mark = createMark(crypto.randomUUID(), link._key, "linkMark");
    const transformedSubtree: IPortableTextItem[] = [link, mark];

    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))

    return transformedSubtree;
}

const transformText = (node: IDomTextNode): IPortableTextSpan => {
    const span = createSpan(crypto.randomUUID(), [], node.content);

    return span;
}

const transformBlock = (node: IDomHtmlNode, listBuffer: IListBuffer): IPortableTextItem[] => {
    const transformedSubtree: IPortableTextItem[] = [createBlock(crypto.randomUUID())];

    node.children.flatMap(node => transformedSubtree.push(...transformNode(node, listBuffer)))

    return transformedSubtree;
}
import { IDomHtmlNode, IDomNode, IDomTextNode, IOutputResult, IPortableTextBlock, IPortableTextImage, IPortableTextItem, IPortableTextListBlock, IPortableTextParagraph, IPortableTextSpan, IPortableTextMark, IPortableTextTable, IPortableTextTableRow, IPortableTextInternalLink, IPortableTextExternalLink, ListType, IReference } from "../../parser"
import { createBlock, createComponentBlock, createExternalLink, createImageBlock, createItemLink, createListBlock, createMark, createSpan, createTable, createTableCell, createTableRow, isElement, isExternalLink, isListBlock, isOrderedListBlock, isText, isUnorderedListBlock } from "../../utils";
import { compose, findLastIndex } from "../../utils/";
import ShortUniqueId from "short-unique-id";

type TransformLinkFunction = (node: IDomHtmlNode) => [(IPortableTextExternalLink | IPortableTextInternalLink), IPortableTextMark];
type TransformElementFunction = (node: IDomHtmlNode) => IPortableTextItem[];
type TransformListItemFunction = (node: IDomHtmlNode, depth: number, listType: ListType) => IPortableTextItem[];
type TransformTextFunction = (node: IDomTextNode) => IPortableTextSpan;

const blockElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const markElements = ['strong', 'em', 'sub', 'sup', 'code'];
const ignoredElements = ['img', 'tbody', 'ol', 'ul'];
const uid = new ShortUniqueId({ length: 16});

export const transform = (parsedTree: IOutputResult): IPortableTextItem[] => {
    const flattened = flatten(parsedTree.children, 0);
    return composeAndMerge(flattened);
}

const mergeSpansAndMarks = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    let marks: string[] = [];
    let links: string[] = [];

    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item) => {
        switch (item._type) {
            case 'internalLink':
            case 'link':
                const lastBlockIndex = findLastIndex(mergedItems, item => item._type === 'block');
                const updatedBlock = mergedItems[lastBlockIndex];
                if ('markDefs' in updatedBlock) {
                    updatedBlock.markDefs.push(item);
                    mergedItems[lastBlockIndex] = updatedBlock;
                } else {
                    const newBlock = createBlock(uid().toString());
                    newBlock.markDefs.push(item);
                }
                break;
            case 'mark':
                marks.push(item.value);
                break;
            case 'linkMark':
                links.push(item.value);
                break;
            case 'span':
                item.marks = [...marks, ...links];
                mergedItems.push(item);
                marks = [];
                break;
            default:
                links = [];
                mergedItems.push(item);
        }
        return mergedItems;
    }, [])

    return mergedItems;
}

const mergeBlocksAndSpans = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item) => {
        if (item._type === 'span') {
            const previousBlock = mergedItems.pop() as IPortableTextParagraph;
            previousBlock.children.push(item);
            mergedItems.push(previousBlock);
        } else {
            mergedItems.push(item);
        }

        return mergedItems;
    }, [])

    return mergedItems;
}

const mergeTablesAndRows = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item) => {
        if (item._type === 'row') {
            const tableBlock = mergedItems.pop() as IPortableTextTable;
            tableBlock.rows.push(item);
            mergedItems.push(tableBlock);
        } else {
            mergedItems.push(item);
        }

        return mergedItems;
    }, [])

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
    }, [])

    return mergedItems;
}

const mergeCellsAndBlocks = (itemsToMerge: IPortableTextItem[]): IPortableTextItem[] => {
    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item, index, array) => {
        if (item._type === 'cell') {
            for (let i = 1; i <= item.childBlocksCount; i++) {
                item.content.push(array[index + i] as IPortableTextBlock);
            }
            array.splice(index, item.childBlocksCount);
            mergedItems.push(item);
        } else {
            mergedItems.push(item);
        }

        return mergedItems;
    }, [])

    return mergedItems;
}

const composeAndMerge = compose(mergeTablesAndRows, mergeRowsAndCells, mergeCellsAndBlocks, mergeBlocksAndSpans, mergeSpansAndMarks);

const flatten = (nodes: IDomNode[], depth: number = 0, listType?: ListType): IPortableTextItem[] => {
    return nodes.reduce((finishedItems: IPortableTextItem[], node: IDomNode) => {
        let transformedNode: IPortableTextItem[] | null = null;
        let children: IDomNode[] = [];
        let transformedChildren: IPortableTextItem[] = [];
        let currentListType = listType;
        let listDepthIncrement = 0;

        if (isElement(node)) {
            children = node.children;
            if (isUnorderedListBlock(node)) {
                currentListType = 'bullet';
                listDepthIncrement = 1;
            }

            if (isOrderedListBlock(node)) {
                currentListType = 'number';
                listDepthIncrement = 1;
            }
        }

        transformedNode = transformNode(node, depth, currentListType);

        if (transformedNode) {
            transformedChildren = flatten(children, depth + listDepthIncrement, currentListType);
            finishedItems.push(...transformedNode, ...transformedChildren);
        }
        return finishedItems;
    }, []);
};

const transformNode = (node: IDomNode, depth: number, listType?: ListType): IPortableTextItem[] => {
    if (isText(node)) {
        return [transformText(node)];
    } else {
        return transformElement(node, depth, listType);
    }
}

const transformElement = (node: IDomHtmlNode, depth: number, listType?: ListType): IPortableTextItem[] => {
    const transformerFunction = transformMap[node.tagName] || transformMap.default;

    return transformerFunction(node, depth, listType!);
}

const transformImage: TransformElementFunction = (node: IDomHtmlNode): IPortableTextImage[] => {
    const block = createImageBlock(uid().toString());
    const imageTag = node.children[0] as IDomHtmlNode;

    block.asset._ref = node.attributes['data-image-id'];
    block.asset.url = imageTag.attributes['src'];

    return [block];
}

const transformTableCell: TransformElementFunction = (node: IDomHtmlNode): IPortableTextItem[] => {
    let listDepth = 0;
    let listNode: IDomNode | undefined;
    const setListDepth = (node: IDomHtmlNode): void => {
        if (listDepth === 0) {
            listNode = node.children.find(childNode =>
                childNode.type === 'tag' &&
                isListBlock(childNode)
            )
        }

        if (listNode && listNode.type === 'tag') {
            let childListNode = listNode.children.find(childNode =>
                childNode.type === 'tag' &&
                isListBlock(childNode)
            )
            
            if (childListNode && childListNode.type === 'tag') {
                listNode = childListNode;
                listDepth++;
                setListDepth(listNode);
            }
        }
    }
    setListDepth(node);
    const childBlocksCount = node.children.length + listDepth;
    const cellContent: IPortableTextItem[] = [createTableCell(uid().toString(), childBlocksCount)];

    if (node.children[0].type === 'text' || ['br','a','strong','em','sup','sub','code'].includes(node.children[0].tagName)) // create block if cell first child isn't one
        cellContent.push(createBlock(uid().toString()));

    return cellContent;
}

const transformItem: TransformElementFunction = (node: IDomHtmlNode): IPortableTextItem[] => {
    const itemReference: IReference = {
        _type: 'reference',
        _ref: node.attributes['data-codename']
    }

    return [createComponentBlock(uid().toString(), itemReference)];
}

const transformLink: TransformLinkFunction = (node: IDomHtmlNode): [IPortableTextExternalLink | IPortableTextInternalLink, IPortableTextMark] => {
    if (isExternalLink(node)) {
        return transformExternalLink(node);
    } else {
        return transformInternalLink(node);
    }
}

const transformInternalLink: TransformLinkFunction = (node: IDomHtmlNode): [IPortableTextInternalLink, IPortableTextMark] => {
    const link = createItemLink(uid().toString(), node.attributes['data-item-id']);
    const mark = createMark(uid().toString(), link._key, 'linkMark');

    return [link, mark];
}

const transformExternalLink: TransformLinkFunction = (node: IDomHtmlNode): [IPortableTextExternalLink, IPortableTextMark] => {
    const link = createExternalLink(uid().toString(), node.attributes)
    const mark = createMark(uid().toString(), link._key, "linkMark");

    return [link, mark];
}

const transformTable: TransformElementFunction = (node: IDomHtmlNode): IPortableTextTable[] => {
    const tableBody = node.children[0] as IDomHtmlNode;
    const tableRow = tableBody.children[0] as IDomHtmlNode;
    const numCols = tableRow.children.length;

    return [createTable(uid().toString(), numCols)];
}

const transformTableRow: TransformElementFunction = (): IPortableTextTableRow[] =>
    [createTableRow(uid().toString())];

const transformText: TransformTextFunction = (node: IDomTextNode): IPortableTextSpan =>
    createSpan(uid().toString(), [], node.content);

const transformBlock: TransformElementFunction = (node: IDomHtmlNode): IPortableTextBlock[] =>
    [createBlock(uid().toString(), undefined, node.tagName === 'p' ? 'normal' : node.tagName)];

const transformTextMark: TransformElementFunction = (node: IDomHtmlNode): IPortableTextMark[] =>
    [createMark(uid().toString(), node.tagName, 'mark')];

const transformLineBreak: TransformElementFunction = (): IPortableTextSpan[] =>
    [createSpan(uid().toString(), [], '\n')];

const transformListItem: TransformListItemFunction = (node: IDomHtmlNode, depth: number, listType: ListType): IPortableTextListBlock[] =>
    [createListBlock(uid().toString(), depth, listType!)];

const ignoreElement: TransformElementFunction = (node: IDomHtmlNode) => [];

const transformMap: Record<string, TransformElementFunction | TransformListItemFunction> = {
    ...blockElements.reduce(
        (acc, tagName) => ({
            ...acc,
            [tagName]: transformBlock,
        }), {}
    ),
    ...markElements.reduce(
        (acc, tagName) => ({
            ...acc,
            [tagName]: transformTextMark,
        }), {}
    ),
    ...ignoredElements.reduce(
        (acc, tagName) => ({
            ...acc,
            [tagName]: ignoreElement,
        }), {}
    ),
    'a': transformLink,
    'li': transformListItem,
    'table': transformTable,
    'tr': transformTableRow,
    'td': transformTableCell,
    'br': transformLineBreak,
    'figure': transformImage,
    'object': transformItem,
    default: (node: IDomHtmlNode) => {
        console.log(`No transformer implemented for tag "${node.tagName}"`);
        return [];
    }
}

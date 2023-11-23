import ShortUniqueId from "short-unique-id";

import {
    IDomHtmlNode,
    IDomNode,
    IDomTextNode,
    IOutputResult,
    IPortableTextBlock,
    IPortableTextExternalLink,
    IPortableTextInternalLink,
    IPortableTextItem,
    IPortableTextMark,
    IPortableTextParagraph,
    IPortableTextSpan,
    IPortableTextTable,
    IPortableTextTableRow,
    IReference,
    ListType
} from "../../parser"
import {
    compose,
    createBlock,
    createComponentBlock,
    createExternalLink,
    createImageBlock,
    createItemLink,
    createListBlock,
    createMark,
    createSpan,
    createTable,
    createTableCell,
    createTableRow,
    findLastIndex,
    isElement,
    isExternalLink,
    isListBlock,
    isListItem,
    isOrderedListBlock,
    isText,
    isUnorderedListBlock
} from "../../utils"


type TransformLinkFunction = (node: IDomHtmlNode) => [(IPortableTextExternalLink | IPortableTextInternalLink), IPortableTextMark];
type TransformElementFunction = (node: IDomHtmlNode) => IPortableTextItem[];
type TransformListItemFunction = (node: IDomHtmlNode, depth: number, listType: ListType) => IPortableTextItem[];
type TransformTextFunction = (node: IDomTextNode) => IPortableTextSpan;
type MergePortableTextItemsFunction = (itemsToMerge: IPortableTextItem[]) => IPortableTextItem[];

const blockElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
const markElements = ['strong', 'em', 'sub', 'sup', 'code', 'a'];
const lineBreakElement = 'br';
const ignoredElements = ['img', 'tbody', 'ol', 'ul'];
const uid = new ShortUniqueId({ length: 16 });

export const transformToPortableText = (parsedTree: IOutputResult): IPortableTextItem[] => {
    const flattened = flatten(parsedTree.children);
    return composeAndMerge(flattened);
}

const mergeSpansAndMarks: MergePortableTextItemsFunction = (itemsToMerge) => {
    let marks: string[] = [];
    let links: string[] = [];
    let linkChildCount = 0;

    const mergedItems = itemsToMerge.reduce<IPortableTextItem[]>((mergedItems, item) => {
        switch (item._type) {
            case 'internalLink':
            case 'link': {
                const lastBlockIndex = findLastIndex(mergedItems, item => item._type === 'block');
                const updatedBlock = mergedItems[lastBlockIndex];
                if ('markDefs' in updatedBlock) {
                    updatedBlock.markDefs.push(item);
                    mergedItems[lastBlockIndex] = updatedBlock;
                } else {
                    const newBlock = createBlock(uid().toString());
                    newBlock.markDefs.push(item);
                    mergedItems.push(newBlock);
                }
                break;
            }
            case 'mark':
                marks.push(item.value);
                break;
            case 'linkMark':
                links.push(item.value);
                linkChildCount = item.childCount;
                break;
            case 'span':
                if (linkChildCount === 0) {
                    links = [];
                } else {
                    linkChildCount--;
                }
                item.marks = [...marks, ...links];
                mergedItems.push(item);
                marks = [];
                break;
            default:
                links = [];
                mergedItems.push(item);
                break;
        }
        return mergedItems;
    }, []);

    return mergedItems;
};

const mergeBlocksAndSpans: MergePortableTextItemsFunction = (itemsToMerge) => {
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

const mergeTablesAndRows: MergePortableTextItemsFunction = (itemsToMerge) => {
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

const mergeRowsAndCells: MergePortableTextItemsFunction = (itemsToMerge) => {
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

const composeAndMerge = compose(mergeTablesAndRows, mergeRowsAndCells, mergeBlocksAndSpans, mergeSpansAndMarks);

const flatten = (nodes: IDomNode[], depth = 0, lastListElement?: IDomHtmlNode, listType?: ListType): IPortableTextItem[] => {
    return nodes.flatMap((node: IDomNode) => {
        let children: IDomNode[] = [];
        let transformedChildren: IPortableTextItem[] = [];
        let currentListType = listType;
        const finishedItems: IPortableTextItem[] = [];

        if (isElement(node)) {
            children = node.tagName === 'td' ? [] : node.children;
            if (isUnorderedListBlock(node)) {
                lastListElement = node;
                currentListType = 'bullet';
            }

            else if (isOrderedListBlock(node)) {
                lastListElement = node;
                currentListType = 'number';
            }

            else if (isListItem(node)) {
                if(lastListElement && isListBlock(lastListElement))
                    depth = depth + 1;
                lastListElement = node;
            }
        }

        const transformedNode = transformNode(node, depth, currentListType);
        transformedChildren = flatten(children, depth, lastListElement, currentListType);
        finishedItems.push(...transformedNode, ...transformedChildren);

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
    const transformerFunction = transformMap[node.tagName];

    return transformerFunction(node, depth, listType!);
}

const transformImage: TransformElementFunction = (node) => {
    const block = createImageBlock(uid().toString());
    const imageTag = node.children[0] as IDomHtmlNode;

    block.asset._ref = node.attributes['data-image-id'];
    block.asset.url = imageTag.attributes['src'];

    return [block];
}

const transformTableCell: TransformElementFunction = (node) => {
    const cellContent = flatten(node.children);
    const isFirstChildText = (
        node.children[0]?.type === 'text' ||
        [lineBreakElement, ...markElements].includes(node.children[0]?.tagName)
    );
    
    /**
     * cell content may not start with <p> but can be directly text, 
     * styled text (e.g. <strong>), anchor or a line break. 
     * in such cases, a block has to be created manually first.
     */
    if(isFirstChildText)
        cellContent.unshift(createBlock(uid().toString()));

    const mergedCellContent = composeAndMerge(cellContent);
    const tableCell = createTableCell(uid().toString(), mergedCellContent.length);
    tableCell.content = mergedCellContent as IPortableTextBlock[];

    return [tableCell];
};

const transformItem: TransformElementFunction = (node) => {
    const itemReference: IReference = {
        _type: 'reference',
        _ref: node.attributes['data-codename']
    }

    return [createComponentBlock(uid().toString(), itemReference)];
}

const transformLink: TransformLinkFunction = (node) => {
    if (isExternalLink(node)) {
        return transformExternalLink(node);
    } else {
        return transformInternalLink(node);
    }
}

const transformInternalLink: TransformLinkFunction = (node) => {
    const link = createItemLink(uid().toString(), node.attributes['data-item-id']);
    const mark = createMark(uid().toString(), link._key, 'linkMark', node.children.length);

    return [link, mark];
}

const transformExternalLink: TransformLinkFunction = (node) => {
    const link = createExternalLink(uid().toString(), node.attributes)
    const mark = createMark(uid().toString(), link._key, "linkMark", node.children.length);

    return [link, mark];
}

const transformTable: TransformElementFunction = (node) => {
    const tableBody = node.children[0] as IDomHtmlNode;
    const tableRow = tableBody.children[0] as IDomHtmlNode;
    const numCols = tableRow.children.length;

    return [createTable(uid().toString(), numCols)];
}

const transformTableRow: TransformElementFunction = (): IPortableTextTableRow[] =>
    [createTableRow(uid().toString())];

const transformText: TransformTextFunction = (node) =>
    createSpan(uid().toString(), [], node.content);

const transformBlock: TransformElementFunction = (node) =>
    [createBlock(uid().toString(), undefined, node.tagName === 'p' ? 'normal' : node.tagName)];

const transformTextMark: TransformElementFunction = (node) =>
    [createMark(uid().toString(), node.tagName, 'mark', node.children.length)];

const transformLineBreak: TransformElementFunction = () =>
    [createSpan(uid().toString(), [], '\n')];

const transformListItem: TransformListItemFunction = (_, depth, listType) =>
    [createListBlock(uid().toString(), depth, listType!)];

const ignoreElement: TransformElementFunction = () => [];

const transformMap: Record<string, TransformElementFunction | TransformListItemFunction> = {
    ...Object.fromEntries(
        blockElements.map(tagName => [tagName, transformBlock])
    ),
    ...Object.fromEntries(
        markElements.map(tagName => [tagName, transformTextMark])
    ),
    ...Object.fromEntries(
        ignoredElements.map(tagName => [tagName, ignoreElement])
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
        throw new Error(`No transformer implemented for tag "${node.tagName}"`)
    }
};


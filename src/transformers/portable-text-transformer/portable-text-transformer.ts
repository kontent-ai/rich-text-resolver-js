import { 
    PortableTextListItemType, 
    PortableTextBlock, 
} from '@portabletext/types';
import {
    PortableTextExternalLink,
    PortableTextInternalLink,
    PortableTextLink,
    PortableTextObject,
    PortableTextStrictBlock,
    PortableTextTable,
    PortableTextTableRow,
    Reference,
} from "../../transformers/"
import {
    IDomHtmlNode,
    IDomNode,
    IOutputResult,
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
    isUnorderedListBlock,
    textStyleElements,
    blockElements,
    ignoredElements,
    MergePortableTextItemsFunction,
    TransformElementFunction,
    TransformLinkFunction,
    TransformListItemFunction,
    TransformTextFunction,
    lineBreakElement,
    uid,
    TextStyleElement,
    markElements,
    MarkElement,
    ValidElement,
    BlockElement,
    IgnoredElement,
    TransformFunction
} from "../../utils"

export const transformToPortableText = (parsedTree: IOutputResult): PortableTextBlock[] => {
    const flattened = flatten(parsedTree.children);
    return composeAndMerge(flattened) as PortableTextBlock[];
}

const handleLinkTypes = (mergedItems: PortableTextObject[], linkItem: PortableTextLink) => {
    const lastBlockIndex = findLastIndex(mergedItems, item => item._type === 'block');
    if (lastBlockIndex !== -1) {
        const updatedBlock = mergedItems[lastBlockIndex] as PortableTextBlock;
        updatedBlock.markDefs = updatedBlock.markDefs || [];
        updatedBlock.markDefs.push(linkItem);
    } else {
        // create new block if no parent was found (happens in tables)
        const newBlock = createBlock(uid().toString());
        newBlock.markDefs = [linkItem];
        mergedItems.push(newBlock);
    }
}

const mergeSpansAndMarks: MergePortableTextItemsFunction = (itemsToMerge) => {
    let marks: string[] = [];
    let links: string[] = [];
    let linkChildCount = 0;

    const mergedItems = itemsToMerge.reduce<PortableTextObject[]>((mergedItems, item) => {
        switch (item._type) {
            case 'internalLink':
            case 'link':
                handleLinkTypes(mergedItems, item);
                break;
            case 'mark':
                marks.push(item.value);
                break;
            case 'linkMark':
                links.push(item.value);
                linkChildCount = item.childCount;
                break;
            case 'span':
                /**
                 * both styles (strong, em, etc.) and links are represented as "marks" in portable text.
                 * the logic below handles the following situation (note the duplication of <strong> tag pairs):
                 * 
                 * <p><strong>bold text </strong><a href=""><strong>bold text link</strong> regular text link</a> regular text</p>
                 * 
                 * in this case, a link can have multiple child nodes if some of its text is styled. 
                 * as a result, keeping a counter for the link's children and decrementing it with each subsequent span occurrence
                 * is required so that the link mark doesn't extend beyond its scope. 
                 */
                item.marks = [...marks, ...(linkChildCount > 0 ? links : [])];
                // ensures the child count doesn't go below zero
                linkChildCount = Math.max(0, linkChildCount - 1);
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
    const mergedItems = itemsToMerge.reduce<PortableTextObject[]>((mergedItems, item) => {
        if (item._type === 'span') {
            const previousBlock = mergedItems.pop() as PortableTextStrictBlock;
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
    const mergedItems = itemsToMerge.reduce<PortableTextObject[]>((mergedItems, item) => {
        if (item._type === 'row') {
            const tableBlock = mergedItems.pop() as PortableTextTable;
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
    const mergedItems = itemsToMerge.reduce<PortableTextObject[]>((mergedItems, item) => {
        if (item._type === 'cell') {
            const tableRow = mergedItems.pop() as PortableTextTableRow;
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

const flatten = (nodes: IDomNode[], depth = 0, lastListElement?: IDomHtmlNode, listType?: PortableTextListItemType): PortableTextObject[] => {
    return nodes.flatMap((node: IDomNode) => {
        let children: IDomNode[] = [];
        let transformedChildren: PortableTextObject[] = [];
        let currentListType = listType;
        const finishedItems: PortableTextObject[] = [];

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

const transformNode = (node: IDomNode, depth: number, listType?: PortableTextListItemType): PortableTextObject[] => {
    if (isText(node)) {
        return [transformText(node)];
    } else {
        return transformElement(node, depth, listType);
    }
}

const transformElement = (node: IDomHtmlNode, depth: number, listType?: PortableTextListItemType): PortableTextObject[] => {
    const transformerFunction = transformMap[node.tagName as ValidElement];

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
        [lineBreakElement, ...markElements].includes(node.children[0]?.tagName as (MarkElement | 'br'))
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
    tableCell.content = mergedCellContent as PortableTextBlock[];

    return [tableCell];
};

const transformItem: TransformElementFunction = (node) => {
    const itemReference: Reference = {
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

const transformTableRow: TransformElementFunction = (): PortableTextTableRow[] =>
    [createTableRow(uid().toString())];

const transformText: TransformTextFunction = (node) =>
    createSpan(uid().toString(), [], node.content);

const transformBlock: TransformElementFunction = (node) =>
    [createBlock(uid().toString(), undefined, node.tagName === 'p' ? 'normal' : node.tagName)];

const transformTextMark: TransformElementFunction = (node) =>
    [createStyleMark(uid().toString(), node.tagName as TextStyleElement)];

const transformLineBreak: TransformElementFunction = () =>
    [createSpan(uid().toString(), [], '\n')];

const transformListItem: TransformListItemFunction = (_, depth, listType) =>
    [createListBlock(uid().toString(), depth, listType!)];

const ignoreElement: TransformElementFunction = () => [];

const transformMap: Record<ValidElement, TransformFunction> = {
    ...Object.fromEntries(
        blockElements.map(tagName => [tagName, transformBlock])
    ) as Record<BlockElement, TransformFunction>,
    ...Object.fromEntries(
        textStyleElements.map(tagName => [tagName, transformTextMark])
    )as Record<TextStyleElement, TransformFunction>,
    ...Object.fromEntries(
        ignoredElements.map(tagName => [tagName, ignoreElement])
    )as Record<IgnoredElement, TransformFunction>,
    'a': transformLink,
    'li': transformListItem,
    'table': transformTable,
    'tr': transformTableRow,
    'td': transformTableCell,
    'br': transformLineBreak,
    'figure': transformImage,
    'object': transformItem,
};


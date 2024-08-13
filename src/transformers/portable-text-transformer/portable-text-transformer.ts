import { PortableTextBlock,PortableTextListItemType } from '@portabletext/types'

import {
    DomHtmlNode,
    DomNode,
    FigureElementAttributes,
    ImgElementAttributes,
    ItemLinkElementAttributes,
    ObjectElementAttributes,
    ParseResult,
} from "../../parser/index.js";
import {
    ModularContentType,
    PortableTextItem,
    PortableTextLink,
    PortableTextObject,
    PortableTextStrictBlock,
    PortableTextTable,
    PortableTextTableRow,
    Reference,
    TextMarkType,
} from "../../transformers/index.js"
import {
    BlockElement,
    blockElements,
    compose,
    countChildTextNodes,
    createBlock,
    createComponentBlock,
    createExternalLink,
    createImageBlock,
    createItemLink,
    createLinkMark,
    createListBlock,
    createSpan,
    createMark,
    createTable,
    createTableCell,
    createTableRow,
    IgnoredElement,
    ignoredElements,
    isElement,
    isItemLink,
    isListBlock,
    isListItem,
    isText,
    isUnorderedListBlock,
    lineBreakElement,
    MarkElement,
    markElements,
    MergePortableTextItemsFunction,
    TextStyleElement,
    textStyleElements,
    TransformElementFunction,
    TransformFunction,
    TransformLinkFunction,
    TransformListItemFunction,
    TransformTableCellFunction,
    TransformTextFunction,
    uid,
    ValidElement
} from "../../utils/index.js"

/**
 * Transforms a parsed tree into an array of Portable Text Blocks.
 *
 * This function takes the parsed tree of a rich text content, flattens it to an array of intermediate
 * Portable Text Objects, and then composes and merges these objects into an array of Portable Text Blocks.
 *
 * @param {ParseResult} parsedTree The parsed tree structure representing the rich text content.
 * @returns {PortableTextObject[]} An array of Portable Text Blocks representing the structured content.
 */
export const transformToPortableText = (parsedTree: ParseResult): PortableTextObject[] => {
    const flattened = flatten(parsedTree.children);

    return composeAndMerge(flattened) as PortableTextObject[];
}

/**
 * Processes and attaches a link type (internal or external) to the most recent text block, or creates a new block if necessary.
 * 
 * This function iterates through the array of PortableTextObjects to find the last text block. If found, it adds the link item 
 * to the mark definitions of the block. If no text block is found (which can happen in structures like tables), a new text 
 * block is created with the link item.
 *
 * @param {PortableTextItem[]} mergedItems - The array of PortableTextItems being processed.
 * @param {PortableTextLink} linkItem - The link item (either internal or external) to be added to the text block's mark definitions.
 */
const handleLinks = (mergedItems: PortableTextItem[], linkItem: PortableTextLink) => {
    const lastBlockIndex = mergedItems.findLastIndex(item => item._type === 'block');
    if (lastBlockIndex !== -1) {
        const lastBlock = mergedItems[lastBlockIndex] as PortableTextBlock;
        lastBlock.markDefs = lastBlock.markDefs || [];
        lastBlock.markDefs.push(linkItem);
    } else {
        const newBlock = createBlock(uid().toString());
        newBlock.markDefs = [linkItem];
        mergedItems.push(newBlock);
    }
}

/**
 * Merges spans and marks into an array of `PortableTextObjects`.
 *
 * @param {ReadonlyArray<PortableTextItem>} itemsToMerge - The array of PortableTextItems to be merged.
 * @returns {PortableTextItem[]} The array of PortableTextItems after merging spans and marks.
 */
const mergeSpansAndMarks: MergePortableTextItemsFunction = (itemsToMerge) => {
    /**
     * mutable array of tuples, each containing either a style mark or a guid reference to an anchor link,
     * in a number corresponding to total number of child text nodes that the mark should affect.
     */
    let markSets: TextMarkType[][] = [];

    return itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
        switch (item._type) {
            case 'internalLink':
            case 'link':
                handleLinks(mergedItems, item);
                break;
            case 'mark':
                /**
                 * push a tuple of marks, sized to match the number of affected child text nodes
                 */
                markSets.push(Array(item.childCount).fill(item.value));
                break;
            case 'span':
                /**
                 * mutate markSets array by popping a single mark from each tuple and assign it
                 * to the span's marks array. remove empty tuples.
                 */
                markSets = markSets.filter(marks => marks.length > 0);
                item.marks = markSets.map(marks => marks.pop()).filter((mark): mark is string => Boolean(mark));
                mergedItems.push(item);
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
    const mergedItems = itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
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
    const mergedItems = itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
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
    const mergedItems = itemsToMerge.reduce<PortableTextItem[]>((mergedItems, item) => {
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

/**
 * Flattens a tree of DomNodes into an array of PortableTextObjects.
 * 
 * This function recursively processes a tree structure, transforming each node to its corresponding 
 * PortableTextItem, picking a suitable method using `transformNode`. The resulting array is flat, to be
 * processed with subsequent merge methods.
 * 
 * @param {DomNode[]} nodes - The array of DomNodes to be flattened.
 * @param {number} [depth=0] - The current depth in the tree, used for list items.
 * @param {DomHtmlNode} [lastListElement] - The last processed list element, used for tracking nested lists.
 * @param {PortableTextListItemType} [listType] - The type of the current list being processed (bullet or number).
 * @returns {PortableTextItem[]} The flattened array of PortableTextItems.
 */
const flatten = (nodes: DomNode[], depth = 0, lastListElement?: DomHtmlNode, listType?: PortableTextListItemType): PortableTextItem[] => {
    return nodes.flatMap((node: DomNode): PortableTextItem[] => {
        let currentListType = listType;

        if (isElement(node)) {
            if (node.tagName === 'td') {
                // table cells are resolved recursively in transformTableCell
                return transformTableCell(node);
            }

            if (isListBlock(node)) {
                // if a list block is found, set a corresponding list type and lastListElement
                lastListElement = node;
                currentListType = isUnorderedListBlock(node) ? 'bullet' : 'number';
            } 
            
            if (isListItem(node)) {
                // set depth to 1 for the first list item encountered and increment for each nested list found
                if (lastListElement && isListBlock(lastListElement)) {
                    depth++;
                }
                // ensures depth remains the same until a nested listBlock is found
                lastListElement = undefined;
            }

            // Recursively flatten children and concatenate with the transformed node.
            const transformedNode = transformNode(node, depth, currentListType);
            const transformedChildren = flatten(node.children, depth, lastListElement, currentListType);
            return [...transformedNode, ...transformedChildren];
        }

        // If not an element, transform as text and return as array
        return [transformText(node)]
    });
};

const transformNode = (node: DomNode, depth: number, listType?: PortableTextListItemType): PortableTextItem[] => {
    if (isText(node)) {
        return [transformText(node)];
    } else {
        return transformElement(node, depth, listType);
    }
}

const transformElement = (node: DomHtmlNode, depth: number, listType?: PortableTextListItemType): PortableTextItem[] => {
    const transformFunction = transformMap[node.tagName as ValidElement];

    return transformFunction(node, depth, listType!);
}

const transformImage: TransformElementFunction<FigureElementAttributes> = (node) => {
    const imageTag = node.children[0] as DomHtmlNode<ImgElementAttributes>;
    const block = createImageBlock(uid().toString());

    block.asset._ref = node.attributes['data-asset-id'];
    block.asset.url = imageTag.attributes['src'];
    block.asset.alt = imageTag.attributes['alt'];

    return [block];
}

const transformTableCell: TransformTableCellFunction = (node) => {
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

const transformItem: TransformElementFunction<ObjectElementAttributes> = (node) => {
    // data-codename reference is for DAPI, data-id for MAPI
    const itemReference: Reference = {
      _type: "reference",
      _ref: node.attributes["data-codename"] || node.attributes["data-id"],
    };

    /**
     * data-rel is only present in DAPI and acts as a differentiator
     * between component and linked item in rich text
     * 
     * data-type is present in both DAPI and MAPI but differentiates
     * only in the latter
     */
    const modularContentType = node.attributes['data-rel'] ?? node.attributes['data-type'] as ModularContentType;

    return [createComponentBlock(uid().toString(), itemReference, modularContentType)];
}

const transformLink: TransformLinkFunction = (node) => {
    return isItemLink(node)
    ? transformItemLink(node)
    : transformExternalLink(node);
}

const transformItemLink: TransformLinkFunction<ItemLinkElementAttributes> = (node) => {
    const link = createItemLink(uid().toString(), node.attributes['data-item-id']);
    const mark = createMark(uid().toString(), link._key, countChildTextNodes(node));

    return [link, mark];
}

const transformExternalLink: TransformLinkFunction = (node) => {
    const link = createExternalLink(uid().toString(), node.attributes)
    const mark = createMark(uid().toString(), link._key, countChildTextNodes(node));

    return [link, mark];
}

const transformTable: TransformElementFunction = (node) => {
    const tableBody = node.children[0] as DomHtmlNode;
    const tableRow = tableBody.children[0] as DomHtmlNode;
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
    [createMark(uid().toString(), node.tagName as TextStyleElement, countChildTextNodes(node))];

const transformLineBreak: TransformElementFunction = () =>
    [createSpan(uid().toString(), [], '\n')];

const transformListItem: TransformListItemFunction = (_, depth, listType) =>
    [createListBlock(uid().toString(), depth, listType)];

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


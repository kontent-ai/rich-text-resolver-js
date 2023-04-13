import { IPortableTextSpan, IPortableTextMarkDef, IPortableTextParagraph, IPortableTextListBlock, IPortableTextImage, IPortableTextTable, IPortableTextInternalLink, IPortableTextTableRow, IPortableTextTableCell, IPortableTextExternalLink, IPortableTextMark, IReference, IPortableTextComponent, IPortableTextItem } from "../parser"

export const createSpan = (
    guid: string,
    marks?: string[],
    text?: string
): IPortableTextSpan => {
    return {
        _type: 'span',
        _key: guid,
        marks: marks || [],
        text: text || ''
    }
}

export const createBlock = (
    guid: string,
    markDefs?: IPortableTextMarkDef[],
    style?: string,
    children?: IPortableTextSpan[]
): IPortableTextParagraph => {
    return {
        _type: 'block',
        _key: guid,
        markDefs: markDefs || [],
        style: style || 'normal',
        children: children || []
    }
}

export const createListBlock = (
    guid: string,
    level: number,
    listItem: "number" | "bullet",
    markDefs?: IPortableTextMarkDef[],
    style?: string,
    children?: IPortableTextSpan[],

): IPortableTextListBlock => {
    return {
        _type: 'block',
        _key: guid,
        markDefs: markDefs || [],
        level: level,
        listItem: listItem,
        style: style || 'normal',
        children: children || []
    }
}

export const createImageBlock = (
    guid: string
): IPortableTextImage => {
    return {
        _type: 'image',
        _key: guid,
        asset: {
            _type: 'reference',
            _ref: '',
            url: ''
        }
    }
}

export const createTableBlock = (guid: string, columns: number): IPortableTextTable => {
    return {
        _type: 'table',
        _key: guid,
        numColumns: columns,
        rows: []
    }
}

export const createItemLink = (guid: string, reference: string): IPortableTextInternalLink => {
    return {
        _key: guid,
        _type: 'internalLink',
        reference: {
            _type: 'reference',
            _ref: reference
        }
    }
}

export const createTable = (guid: string, numColumns: number): IPortableTextTable => {
    return {
        _key: guid,
        _type: 'table',
        numColumns: numColumns,
        rows: []
    }
}

export const createTableRow = (guid: string): IPortableTextTableRow => {
    return {
        _key: guid,
        _type: 'row',
        cells: []
    }
}

export const createTableCell = (guid: string, childCount: number): IPortableTextTableCell => {
    return {
        _key: guid,
        _type: 'cell',
        content: [],
        childBlocksCount: childCount
    }
}

export const createExternalLink = (guid: string, attributes: Record<string, string>): IPortableTextExternalLink => {
    return {
        _key: guid,
        _type: 'link',
        ...attributes
    }
}

export const createMark = (guid: string, value: string, type: 'mark' | 'linkMark', childCount: number): IPortableTextMark => {
    return {
        _type: type,
        _key: guid,
        value: value,
        childCount: childCount
    }
}

export const createComponentBlock = (guid: string, reference: IReference): IPortableTextComponent => {
    return {
        _type: 'component',
        _key: guid,
        component: reference
    }
}

export const isBlock = (block?: IPortableTextItem): block is IPortableTextParagraph =>
    block! && block._type === 'block';

export const isSpan = (span?: IPortableTextItem): span is IPortableTextSpan =>
    span! && span._type === 'span';

export const compose = <T>(firstFunction: (argument: T) => T, ...functions: Array<(argument: T) => T>) =>
    functions.reduce((previousFunction, nextFunction) => value => previousFunction(nextFunction(value)), firstFunction);

export const findLastIndex = <T>(arr: T[], predicate: (value: T) => boolean): number => {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) {
            return i;
        }
    }
    return -1;
}

export const resolveTable = (table: IPortableTextTable, resolver: (value: any) => string): string => {
    let tableHtml = '<table><tbody>';
    for (let i = 0; i < table.numColumns; i++) {
        let currentRow = table.rows[i];
        tableHtml += '<tr>';
        currentRow.cells.forEach((cell: IPortableTextTableCell) => {
            tableHtml += '<td>';
            for (let j = 0; j < cell.childBlocksCount; j++) {
                tableHtml += resolver(cell.content);
            }
            tableHtml += '</td>';
        });
        tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';
    return tableHtml;
}

export const getAllNewLineAndWhiteSpace = /\n\s*/g;
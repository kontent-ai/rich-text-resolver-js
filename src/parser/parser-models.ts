export type IDomNode = IDomHtmlNode | IDomTextNode;

export interface IDomTextNode {
    type: 'text',
    content: string
}

export interface IDomHtmlNode {
    type: 'tag',
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[],
    parent?: IDomHtmlNode
}

export interface IParserEngine {
    parse(html: string): any;
}

export interface IOutputResult {
    children: IDomNode[]
}

export interface IRichTextParser<TInput, TOutput> {
    parse(input: TInput): TOutput
}

/// portable text section


export interface IPortableTextParagraph  {
    _type: 'block',
    _key: string,
    markDefs: IPortableTextMarkDef[],
    style: string,
    children: IPortableTextSpan[]
}

export type IPortableTextMarkDef = IPortableTextExternalLink | IPortableTextInternalLink; // add more markdefs

export interface IPortableTextExternalLink  {
    _key: string;
    _type: 'link'
}

export interface IPortableTextInternalLink  {
    _key: string,
    _type: 'internalLink',
    reference: IReference
}

export interface IPortableTextListBlock  {
    _key: string,
    _type: "block",
    listItem: "number" | "bullet",
    level: number,
    style: string,
    markDefs: IPortableTextMarkDef[],
    children: IPortableTextSpan[],
}

export type IPortableTextItem = IPortableTextBlock | IPortableTextSpan | IPortableTextInternalLink | IPortableTextExternalLink;

export type IPortableTextBlock = IPortableTextListBlock | IPortableTextParagraph | IPortableTextImage | IPortableTextComponent | IPortableTextMark | IPortableTextTable | IPortableTextTableCell | IPortableTextTableRow;

export interface IPortableTextSpan  {
    _key: string,
    _type: 'span',
    marks: string[],
    text: string
}

export interface IBlockBuffer {
    element?: IPortableTextBlock,
    marks: string[],
    finishedBlocks: IPortableTextBlock[],
    listLevel: number,
    listType?: 'number' | 'bullet'
}

export interface IListBuffer {
    level: number,
    type: 'number' | 'bullet',
    isNested: boolean
}

export interface IPortableTextImage {
    _key: string,
    _type: 'image',
    asset: IAssetReference
}

export interface IReference {
    _type: 'reference',
    _ref: string
}

export interface IAssetReference extends IReference {
    url: string
}

export interface IPortableTextTable {
    _type: 'table',
    _key: string,
    numColumns: number,
    rows: IPortableTextTableRow[],
}

export interface IPortableTextTableRow {
    _key: string,
    _type: 'row',
    cells: IPortableTextTableCell[]
}

export interface IPortableTextTableCell {
    _key: string,
    _type: 'cell',
    childBlocksCount: number,
    content: IPortableTextBlock[]
}

export interface IPortableTextComponent {
    _key: string,
    _type: 'component',
    component: IReference
}

export interface IPortableTextStyleMark  {
    _key: string,
    _type: 'mark',
    value: string
}

export interface IPortableTextLinkMark {
    _key: string,
    _type: 'linkMark',
    value: string
}

export type IPortableTextMark = IPortableTextLinkMark | IPortableTextStyleMark

export class ListNode<T> {
    next: ListNode<T> | null = null;
    prev: ListNode<T> | null = null;
    constructor(public data: T) {};
}

export interface IDoublyLinkedList<T> {
    append(data: T): ListNode<T>;
    prepend(data: T): ListNode<T>;
    deleteNode(node: ListNode<T>): void;
    size(): number;
    search(comparator: (data: T) => boolean): ListNode<T> | null;
}

export class DoublyLinkedList<T> implements IDoublyLinkedList<T> {
    private head: ListNode<T> | null = null;

    public append(data: T): ListNode<T> {
        const listNode = new ListNode(data);
        if(!this.head) {
            this.head = listNode;
        } else {
            const getLast = (node: ListNode<T>): ListNode<T> => {
                return listNode.next ? getLast(listNode.next) : node;
            };

            const lastListNode = getLast(this.head);
            listNode.prev = lastListNode;
            lastListNode.next = listNode;
        }
        return listNode;
    }

    public prepend(data: T): ListNode<T> {
        const listNode = new ListNode(data);
        if(!this.head) {
            this.head = listNode;
        } else {
            this.head.prev = listNode;
            listNode.next = this.head;
            this.head = listNode;
        }
        return listNode;
    }

    public deleteNode(listNode: ListNode<T>): void {
        if (!listNode.prev) {
            this.head = listNode.next;
        } else {
            const prevNode = listNode.prev;
            prevNode.next = listNode.next;
        }
    }

    public traverse(): Array<T> {
        const array: T[] = [];
        if(!this.head) {
            return array;
        }

        const addToArray = (listNode: ListNode<T>): T[] => {
            array.push(listNode.data);
            return listNode.next ? addToArray(listNode.next) : array;
        };

        return addToArray(this.head);
    }

    size(): number {
        throw new Error("Method not implemented.");
    }

    search(comparator: (data: T) => boolean): ListNode<T> | null {
        throw new Error("Method not implemented.");
    }
    
}
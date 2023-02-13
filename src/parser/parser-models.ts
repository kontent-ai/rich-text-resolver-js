export type IDomNode = IDomHtmlNode | IDomTextNode;

export interface IDomTextNode {
    type: 'text'
    content: string
}

export interface IDomHtmlNode {
    type: 'tag',
    tagName: string,
    attributes: Record<string, string>,
    children: IDomNode[]
}

export interface IParserEngine {
    parse(html: string): any;
}

export type RichTextInput = {
    value: string,
    images?: {
        [key: string]: {
            image_id?: string,
            description?: string | null,
            url: string,
            width?: number | null, // TODO changed from undefined for easier SDK conversion. potential problems?
            height?: number | null
        }
    },
    links?: {
        [key: string]: {
            codename: string,
            type?: string,
            url_slug?: string
        }
    },
    modular_content?: string[],
    linked_items?: { [key: string]: {} }
}

export interface IOutputResult {
    childNodes: IDomNode[]
}

export interface IRichTextParser<TInput, TOutput> {
    parse(input: TInput): TOutput
}
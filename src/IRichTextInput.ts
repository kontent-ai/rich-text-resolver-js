// TODO zkontrolovat optional a required

export type IRichTextInput = {
    value: string,
    images: {[key: string]: {
        image_id: string,
        description: string,
        url: string,
        width: number,
        height: number
    }},
    links: {[key: string]: {
        codename: string,
        type: string,
        url_slug: string
    }},
    modular_content: string[]
}
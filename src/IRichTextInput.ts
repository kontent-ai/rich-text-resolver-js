// TODO zkontrolovat optional a required

export type IRichTextInput = {
    value: string,
    images: {
        [key: string]: {
            image_id: string,
            description: string | null,
            url: string,
            width: number | undefined,
            height: number | undefined
        }
    },
    links: {
        [key: string]: {
            codename: string,
            type: string,
            url_slug: string
        }
    },
    modular_content: string[]
}
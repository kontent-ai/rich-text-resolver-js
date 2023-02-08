# TypeScript rich text resolver for Kontent.ai

This tool provides an alternative to rich text resolution built into the JS SDK, allowing more control over the resolution process, such as specifying the output type and structure.

## Installation

Install the package via npm

```npm i @kontent-ai/rich-text-resolver```

***

## Usage

Resolution is provided via `RichTextResolver<TOutput>` class, where `TOutput` parameter specifies a type (or a union) of the resolved object, such as `string`, `JSX.Element` etc.

### Initialization
By default, the class uses browser built-in `DOMParser` to parse the rich text HTML. If you intend to resolve in Node.js, you need to create an instance of `NodeParser` included in the package and pass it to the class constructor.

An example of initializing Node based resolver for React components:

```ts
import { RichTextResolver } from '@kontent-ai/rich-text-resolver';
import { NodeParser } from '@kontent-ai/rich-text-resolver/parser';

const resolver = new RichTextResolver<JSX.Element>(new NodeParser()); // leave constructor empty for browser parser
```

### Resolution

The resolver exposes single `resolveAsync` method which accepts a structured `RichTextInput`.

Structure of the rich text input mirrors the rich text element response from delivery API:

```ts
export type RichTextInput = {
    value: string,
    images?: {
        [key: string]: {
            image_id?: string,
            description?: string | null,
            url: string,
            width?: number | undefined,
            height?: number | undefined
        }
    },
    links?: {
        [key: string]: {
            codename: string,
            type?: string,
            url_slug?: string
        }
    },
    modular_content?: string[]
}
```

The module provides a helper method to map SDK response to a correct input:

```ts
import { RichTextResolver } from '@kontent-ai/rich-text-resolver';
import { getElementInputFromSdk } from '@kontent-ai/rich-text-resolver/utils'
.
.
.
resolver.resolveAsync(getElementInputFromSdk(sdkRichTextElement))

```

Alternatively, you can map the input yourself, as in the following example:

```ts
resolver.resolveAsync({
    value: props.element.value,
    images: Object.fromEntries(props.element.images.map(image => [image.imageId, {
    image_id: image.imageId,
    description: image.description,
    url: image.url,
    width: image.width || null,
    height: image.height || null
    }])),
    links: Object.fromEntries(props.element.links.map(link => [link.linkId, {
    codename: link.codename,
    type: link.type,
    url_slug: link.urlSlug
    }])),
    modular_content: props.element.linkedItemCodenames
})
```

The output is a tree, represented by the following interface, where TOutput is again `JSX.Element` in our example:

```ts
export interface IOutputResult<TOutput> {
    currentResolvedNode: TOutput | null,
    currentNode: IDomNode | null,
    childResolvedNodes: IOutputResult<TOutput>[],
    childNodes: IDomNode[]
}
```

TODO Examples
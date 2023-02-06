# TypeScript rich text resolver for Kontent.ai

This tool provides an alternative to rich text resolution built into the JS SDK, allowing more control over the resolution process, such as specifying the output type and structure.

## Installation

TODO

***

## Usage

Resolution is provided via `RichTextResolver<TOutput>` class, where `TOutput` parameter specifies a type (or a union) of the resolved object, such as `string`, `JSX.Element` etc. 

> By default, the class uses browser built-in `DOMParser` to parse the rich text HTML. If you intend to resolve in Node.js, you need to create an instance of `NodeParser` included in the package and pass it to the class constructor.

An example of initializing Node based resolver for React components:

```ts
import { RichTextResolver } from 'kontent-rich-text-to-json-converter';
import { NodeParser } from 'kontent-rich-text-to-json-converter/parser';

const resolver = new RichTextResolver<JSX.Element>(new NodeParser());
```

The resolver exposes single `resolveAsync` method which accepts a structured `RichTextInput` and optionally an object with resolution methods.

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

If you use SDK or GraphQL, you'll need to remap the response accordingly and provide at least the required value property, holding the actual HTML representation of the rich text element. 

Assuming we pass the rich text element from SDK response as a prop to our react component, the transformation can look like this:

```ts
    resolver.resolveAsync({
      value: props.element.value,
      images: Object.fromEntries(props.element.images.map(image => [image.imageId, {
        image_id: image.imageId,
        description: image.description,
        url: image.url,
        width: image.width || undefined,
        height: image.height || undefined
      }])),
      links: Object.fromEntries(props.element.links.map(link => [link.linkId, {
        codename: link.codename,
        type: link.type,
        url_slug: link.urlSlug
      }])),
      modular_content: props.element.linkedItemCodenames
    }, {})
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

TODO
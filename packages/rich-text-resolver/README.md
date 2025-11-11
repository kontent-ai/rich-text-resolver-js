# @kontent-ai/rich-text-resolver

[![npm version][npm-shield]](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver)
[![MIT License][license-shield]][license-url]
[![Stack Overflow][stack-shield]](https://stackoverflow.com/tags/kontent-ai)
[![Discord][discord-shield]](https://discord.gg/SKCxwPtevJ)

> [!NOTE] 
> This is part of the [@kontent-ai/rich-text-resolver](../../README.md) monorepo.
> For general information and other packages, see the [main README](../../README.md).

Core package for transforming Kontent.ai rich text into structured formats suitable for resolution and rendering in various environments.

## Installation

```bash
npm i --save @kontent-ai/rich-text-resolver
```

## Features

### Parsing rich text HTML to an array of simplified nodes

The tool provides environment-aware (browser or Node.js) `parseHTML` function to transform HTML into an array of `DomNode` trees. Any valid HTML is parsed, including all attributes. Together with built-in transformation methods, this tool is a suitable option for processing HTML and rich text from external sources, to make it compatible with Kontent.ai rich text format. See dedicated [HTML transformer docs](./docs/index.md) for further information.

### Portable text resolution

[Portable Text](https://github.com/portabletext/portabletext) is a universal standard for rich text representation, with tools available for its transformation and rendering in majority of popular frameworks and formats:
- [@kontent-ai/rich-text-resolver-html](../rich-text-resolver-html) – HTML resolution and MAPI transformation
- [@kontent-ai/rich-text-resolver-react](../rich-text-resolver-react) – React components and helpers
- [@kontent-ai/rich-text-resolver-vue](../rich-text-resolver-vue) – Vue composables and helpers
- [@kontent-ai/rich-text-resolver-markdown](../rich-text-resolver-markdown) – Markdown utilities

> [!TIP]
> You can also find external libraries that enable portable text rendering in other frameworks:
> - **Svelte:** [svelte-portabletext](https://github.com/portabletext/svelte-portabletext)  
> - **Astro:** [astro-portabletext](https://github.com/theisel/astro-portabletext)

This package provides `transformToPortableText` function to convert rich text content into an array of Portable Text blocks, with custom blocks defined for Kontent.ai-specific objects.

Combined with a suitable package for the framework of your choice, this makes for an optimal solution for resolving rich text.

> [!IMPORTANT]
> The provided Portable Text transformation functions expect a valid Kontent.ai rich text content, otherwise you risk errors or invalid blocks in the resulting array.

### Custom portable text blocks

Besides default blocks for common elements, Portable Text supports custom blocks, which can represent other entities. Each custom block should extend `ArbitraryTypedObject` to ensure `_key` and `_type` properties are present. Key should be a unique identifier (e.g. guid), while type should indicate what the block represents. Value of `_type` property is used for mapping purposes in subsequent resolution.

**This package comes with built-in custom block definitions for representing Kontent.ai rich text entities:**

#### Component/linked item – **PortableTextComponentOrItem**

https://github.com/kontent-ai/rich-text-resolver-js/blob/9e08b6952a2cd0d1993bc1359bb30527a0f17a9e/packages/rich-text-resolver/showcase/showcase.ts#L8-L17

#### Image – **PortableTextImage**

https://github.com/kontent-ai/rich-text-resolver-js/blob/9e08b6952a2cd0d1993bc1359bb30527a0f17a9e/packages/rich-text-resolver/showcase/showcase.ts#L19-L29

#### Item link – **PortableTextItemLink**

https://github.com/kontent-ai/rich-text-resolver-js/blob/9e08b6952a2cd0d1993bc1359bb30527a0f17a9e/packages/rich-text-resolver/showcase/showcase.ts#L31-L39

#### Table – **PortableTextTable**

https://github.com/kontent-ai/rich-text-resolver-js/blob/9e08b6952a2cd0d1993bc1359bb30527a0f17a9e/packages/rich-text-resolver/showcase/showcase.ts#L41-L72

## Examples

### Modifying portable text nodes

Package exports a `traversePortableText` method, which accepts an array of `PortableTextObject` and a callback function. The method recursively traverses all nodes and their subnodes, optionally modifying them with the provided callback:

```ts
import {
  PortableTextObject,
  transformToPortableText,
  traversePortableText,
} from "@kontent-ai/rich-text-resolver";

const input = `<figure data-asset-id="guid" data-image-id="guid"><img src="https://asseturl.xyz" data-asset-id="guid" data-image-id="guid" alt=""></figure>`;

// Adds height parameter to asset reference and changes _type.
const processBlocks = (block: PortableTextObject) => {
  if (block._type === "image") {
    const modifiedReference = {
      ...block.asset,
      height: 300
    }

    return {
      ...block,
      asset: modifiedReference,
      _type: "modifiedImage"
    }
  }

    // logic for modifying other object types...

    // return original block if no modifications required
    return block;
}

const portableText = transformToPortableText(input);
const modifiedPortableText = traversePortableText(portableText, processBlocks);
```
[npm-shield]: https://img.shields.io/npm/v/@kontent-ai/rich-text-resolver?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/kontent-ai/rich-text-resolver-js?label=license&style=for-the-badge
[license-url]: https://github.com/kontent-ai/rich-text-resolver-js/blob/main/LICENSE
[stack-shield]: https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white&style=for-the-badge
[discord-shield]: https://img.shields.io/discord/821885171984891914?label=Discord&logo=Discord&logoColor=white&style=for-the-badge
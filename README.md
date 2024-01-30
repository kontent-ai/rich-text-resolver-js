![image](https://github.com/kontent-ai/rich-text-resolver-js/assets/52500882/560ea072-2a0f-4e22-ba3c-300576952198)
# Kontent.ai rich text resolver

![Last modified][last-commit]
[![Issues][issues-shield]][issues-url]
[![Contributors][contributors-shield]][contributors-url]
[![MIT License][license-shield]][license-url]
[![codecov][codecov-shield]][codecov-url]
[![Stack Overflow][stack-shield]](https://stackoverflow.com/tags/kontent-ai)
[![Discord][discord-shield]](https://discord.gg/SKCxwPtevJ)

This package provides you with tools to transform rich text element value from Kontent.ai into a JSON tree and optionally to [portable text standard](https://github.com/portabletext/portabletext).

## Installation

Install the package via npm

`npm i @kontent-ai/rich-text-resolver`

---

## Usage

Module provides two functions to parse rich text HTML into a simplified JSON tree: `browserParse` for client-side resolution and `nodeParse` for server-side use with Node.js. Their use is identical, the only difference is the underlying parsing logic.

Parsed output can then be passed to a `transformToPortableText` function, which converts the JSON tree into portable text blocks.

Full specification of portable text format can be found in [the corresponding repository](https://github.com/portabletext/portabletext).

> 💡 The intermediate JSON structure can be manipulated before rendering into Portable text or used altogether independently. See [JSON transformer](docs/index.md) docs for further information.

### Portable text resolution

Portable text supports majority of popular languages and frameworks.

- React: [react-portabletext](https://github.com/portabletext/react-portabletext)
- HTML: [to-html](https://github.com/portabletext/to-html)
- Svelte: [svelte-portabletext](https://github.com/portabletext/svelte-portabletext)
- Vue: [vue-portabletext](https://github.com/portabletext/vue-portabletext)

Resolution is described in each corresponding repository. You can also find example resolution below.

### Custom portable text blocks

Besides default blocks for common elements, Portable text supports custom blocks, which can represent other entities. Each custom block should extend `ArbitraryTypedObject` to ensure `_key` and `_type` properties are present. Key should be a unique identifier (e.g. guid), while type should indicate what the block represents. Value of `_type` property is used for subsequent override and resolution purposes. **This package comes with built-in custom block definitions for representing Kontent.ai-specific objects:**

#### Component/linked item

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L3-L10

#### Image

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L12-L20

> 💡 For image resolution, you may use `resolveImage` helper function. You can provide it either with a custom resolution method or use provided default implementations for HTML and Vue, `toHTMLImageDefault` and `toVueImageDefault` respectively.

#### Item link

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L22-L29

#### Table

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L31-L58

> 💡 For table resolution, you may use `resolveTable` helper function. You can provide it either with a custom resolution method or use default implementation from a resolution package of your choice (such as `toHTML` or `toPlainText`)


<br>


## Examples

### Modifying portable text nodes

Package exports a `traversePortableText` method, which accepts a `PortableTextObject` and a callback function. The method recursively traverses all subnodes and optionally modifies them with the provided callback:

```ts
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
    }

    const portableText = transformToPortableText(input);
    const modifiedPortableText = portableText.map(block => traversePortableText(block, processBlocks));
```

### Plain HTML resolution

HTML resolution using `@portabletext/to-html` package.

```ts
import { escapeHTML, PortableTextOptions, toHTML } from "@portabletext/to-html";
import { browserParse, transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { resolveTable, resolveImage, toHTMLImageDefault } from "@kontent-ai/rich-text-resolver/utils/html";


const richTextValue = "<rich text html>";
const linkedItems = ["<array of linked items>"]; // e.g. from SDK
const parsedTree = browserParse(richTextValue);
const portableText = transformToPortableText(parsedTree);

const portableTextComponents: PortableTextOptions = {
  components: {
    types: {
      image: ({ value }: PortableTextTypeComponentOptions<PortableTextImage>) => {
        // helper method for resolving images
        return resolveImage(value, toHTMLImageDefault); 
      },
      component: ({ value }: PortableTextTypeComponentOptions<PortableTextComponent>) => {
        const linkedItem = linkedItems.find(
          (item) => item.system.codename === value.component._ref
        );
        switch (linkedItem?.system.type) {
          case "component_type_codename": {
            return `<p>resolved value of text_element: ${linkedItem?.elements.text_element.value}</p>`;
          }
          default: {
            return `Resolver for type ${linkedItem?.system.type} not implemented.`;
          }
        }
      },
      table: ({ value }: PortableTextTypeComponentOptions<PortableTextTable> => {
        // helper method for resolving tables
        const tableHtml = resolveTable(value, toHTML);
        return tableHtml;
      },
    },
    marks: {
      internalLink: ({ children, value }: PortableTextMarkComponentOptions<PortableTextInternalLink>) => {
        return `<a href="https://website.com/${value.reference._ref}">${children}</a>`;
      },
      link: ({ children, value }: PortableTextMarkComponentOptions<PortableTextExternalLink>) => {
        return `<a href=${value?.href!} data-new-window=${value["data-new-window"]}>${children}</a>`;
      },
    },
  },
};

const resolvedHtml = toHTML(portableText, portableTextComponents);
```

### React resolution

React, using `@portabletext/react` package.

```tsx
import { PortableText, PortableTextReactComponents } from "@portabletext/react";

// assumes richTextElement from SDK

const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    component: ({ value }: PortableTextTypeComponentProps<PortableTextComponent>) => {
      const item = richTextElement.linkedItems.find(item => item.system.codename === value.component._ref);
      return <div>{item?.elements.text_element.value}</div>;
    },
    table: ({ value }: PortableTextTypeComponentProps<PortableTextTable>) => {
      const tableString = resolveTable(value, toPlainText);
      return <>{tableString}</>;
    }
  },
  marks: {
    link: ({ value, children }: PortableTextMarkComponentProps<PortableTextExternalLink>) => {
      return (
        <a href={value?.href} rel={value?.rel} title={value?.title} data-new-window={value?.['data-new-window']}>
          {children}
        </a>
      )
    },
    internalLink: ({ value, children }: PortableTextMarkComponentProps<PortableTextInternalLink>) => {
      const item = richTextElement.linkedItems.find(item => item.system.id === value?.reference._ref);
      return (
        <a href={"https://website.xyz/" + item?.system.codename}>
          {children}
        </a>
      )
    }
  }
}

const MyComponent = ({ props }) => {
  // https://github.com/portabletext/react-portabletext#customizing-components

  const parsedTree = browserParse(props.element.value); // or nodeParse for SSR
  const portableText = transformToPortableText(parsedTree);

  return (
    <PortableText value={portableText} components={portableTextComponents} />
  );
};
```

#### Gatsby.js

For [Gatsby.js](https://www.gatsbyjs.com), it is necessary to [ignore the RichText browser module by customizing webpack configuration](https://www.gatsbyjs.com/docs/debugging-html-builds/#fixing-third-party-modules) in order to utilize the package.

```js
// gatsby-node.js

// https://www.gatsbyjs.com/docs/debugging-html-builds/#fixing-third-party-modules
exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /rich-text-browser-parser/,
            use: loaders.null(),
          },
        ],
      },
    });
  }
};
```

### Vue resolution
Using `@portabletext/vue` package

```ts
<script setup>
import {
  PortableText,
  PortableTextComponentProps,
  PortableTextComponents,
  toPlainText,
} from "@portabletext/vue";
import { resolveTable, resolveImage, toVueImageDefault } from "@kontent-ai/rich-text-resolver/utils/vue";


const components: PortableTextComponents = {
  types: {
    image: ({ value }: PortableTextComponentProps<PortableTextImage>) =>
      resolveImage(value, h, toVueImageDefault),
    table: ({ value }: PortableTextComponentProps<PortableTextTable>) =>
      resolveTable(value, h, toPlainText),
  },
  // marks etc.
};
</script>

<template>
  <PortableText :value="props.value" :components="components" />
</template>
```

[last-commit]: https://img.shields.io/github/last-commit/kontent-ai/rich-text-resolver-js?style=for-the-badge
[contributors-shield]: https://img.shields.io/github/contributors/kontent-ai/rich-text-resolver-js?style=for-the-badge
[contributors-url]: https://github.com/kontent-ai/rich-text-resolver-js/graphs/contributors
[issues-shield]: https://img.shields.io/github/issues/kontent-ai/rich-text-resolver-js.svg?style=for-the-badge
[issues-url]: https://github.com/kontent-ai/rich-text-resolver-js/issues
[license-shield]: https://img.shields.io/github/license/kontent-ai/rich-text-resolver-js?label=license&style=for-the-badge
[license-url]: https://github.com/kontent-ai/rich-text-resolver-js/blob/main/LICENSE
[stack-shield]: https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white&style=for-the-badge
[discord-shield]: https://img.shields.io/discord/821885171984891914?label=Discord&logo=Discord&logoColor=white&style=for-the-badge
[codecov-shield]: https://img.shields.io/codecov/c/github/kontent-ai/rich-text-resolver-js/main.svg?style=for-the-badge
[codecov-url]: https://app.codecov.io/github/kontent-ai/rich-text-resolver-js

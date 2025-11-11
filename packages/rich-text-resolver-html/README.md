# @kontent-ai/rich-text-resolver-html

[![npm version][npm-shield]](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-html)
[![MIT License][license-shield]][license-url]
[![Stack Overflow][stack-shield]](https://stackoverflow.com/tags/kontent-ai)
[![Discord][discord-shield]](https://discord.gg/SKCxwPtevJ)

> [!NOTE]
> This is part of the [@kontent-ai/rich-text-resolver](../../README.md) monorepo.
> For general information and other packages, see the [main README](../../README.md).
>
> **Requires:** [@kontent-ai/rich-text-resolver](../rich-text-resolver) as peer dependency

HTML resolution and Management API transformer for Kontent.ai rich text. This package provides modified versions of portable text resolution tools with enhanced support for Kontent.ai-specific elements.

## Installation

```bash
npm i --save @kontent-ai/rich-text-resolver-html
npm i --save @kontent-ai/rich-text-resolver  # peer dependency
```

## Examples

### Plain HTML Resolution

HTML resolution using a slightly modified version of `toHTML` function from `@portabletext/to-html` package.

```ts
import {
  transformToPortableText,
  resolveTable,
  resolveImage,
  PortableTextHtmlResolvers,
  toHTML
} from "@kontent-ai/rich-text-resolver";

const richTextValue = "<rich text html>";
const linkedItems = ["<array of linked items>"]; // e.g. from SDK
const portableText = transformToPortableText(richTextValue);

const resolvers: PortableTextHtmlResolvers = {
  components: {
    types: {
      image: ({ value }) => {
        // helper method for resolving images
        return resolveImage(value);
      },
      componentOrItem: ({ value }) => {
        const linkedItem = linkedItems.find(
          (item) => item.system.codename === value.componentOrItem._ref
        );
        switch (linkedItem?.system.type) {
          case "component_type_codename": {
            return `<p>resolved value of text_element: ${linkedItem?.elements.text_element.value}</p>`;
          }
          default: {
            return `Resolver for type ${linkedItem?.system.type} not implemented.`;
          }
        };
      },
      table: ({ value }) => {
        // helper method for resolving tables
        const tableHtml = resolveTable(value, toHTML);
        return tableHtml;
      },
    },
    marks: {
      contentItemLink: ({ children, value }) => {
        return `<a href="https://website.com/${value.contentItemLink._ref}">${children}</a>`;
      },
      link: ({ children, value }) => {
        return `<a href=${value?.href} data-new-window=${value?.["data-new-window"]}>${children}</a>`;
      },
    },
  },
};

const resolvedHtml = toHTML(portableText, resolvers);
```

### Management API Transformation

`toManagementApiFormat` is a custom transformation method built upon `toHTML` package, allowing you to restore portable text previously created from management API rich text back into MAPI supported format.

```ts
const richTextContent =
  `<p>Here is an <a data-item-id="12345"><strong>internal link</strong></a> in some text.</p>`;

const portableText = transformToPortableText(richTextContent);

// your logic to modify the portable text

const validManagementApiFormat = toManagementApiFormat(portableText);
```

> [!IMPORTANT]
> MAPI transformation logic expects Portable Text that had been previously created from management API rich text and performs only minimal validation. It doesn't provide implicit transformation capabilities from other formats (such as delivery API).
>
> If you're interested in transforming external HTML or rich text to a MAPI compatible format, see [HTML transformer docs](../../docs/index.md) instead.

[npm-shield]: https://img.shields.io/npm/v/@kontent-ai/rich-text-resolver-html?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/kontent-ai/rich-text-resolver-js?label=license&style=for-the-badge
[license-url]: https://github.com/kontent-ai/rich-text-resolver-js/blob/main/LICENSE
[stack-shield]: https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white&style=for-the-badge
[discord-shield]: https://img.shields.io/discord/821885171984891914?label=Discord&logo=Discord&logoColor=white&style=for-the-badge

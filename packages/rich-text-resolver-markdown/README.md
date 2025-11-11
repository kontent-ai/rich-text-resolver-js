# @kontent-ai/rich-text-resolver-markdown

[![npm version][npm-shield]](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-markdown)
[![MIT License][license-shield]][license-url]
[![Stack Overflow][stack-shield]](https://stackoverflow.com/tags/kontent-ai)
[![Discord][discord-shield]](https://discord.gg/SKCxwPtevJ)

> [!NOTE]
> This is part of the [@kontent-ai/rich-text-resolver](../../README.md) monorepo.
> For general information and other packages, see the [main README](../../README.md).
>
> **Requires:** [@kontent-ai/rich-text-resolver](../rich-text-resolver) as peer dependency

Markdown transformation utilities for Kontent.ai rich text. This package provides tools for converting Portable Text blocks to Markdown format.

## Installation

```bash
npm i --save @kontent-ai/rich-text-resolver-markdown
npm i --save @kontent-ai/rich-text-resolver  # peer dependency
```

## Examples

### Markdown Resolution

Markdown resolution using `toMarkdown` function built on top of `@portabletext/to-html` package with custom markdown-specific resolvers.

```ts
import {
  transformToPortableText,
} from "@kontent-ai/rich-text-resolver";
import {
  toMarkdown,
  PortableTextMarkdownResolvers,
} from "@kontent-ai/rich-text-resolver-markdown";

const richTextValue = "<rich text html>";
const linkedItems = ["<array of linked items>"]; // e.g. from SDK
const portableText = transformToPortableText(richTextValue);

const resolvers: PortableTextMarkdownResolvers = {
  components: {
    types: {
      componentOrItem: ({ value }) => {
        const linkedItem = linkedItems.find(
          (item) => item.system.codename === value.componentOrItem._ref
        );
        switch (linkedItem?.system.type) {
          case "component_type_codename": {
            return `**${linkedItem?.elements.text_element.value}**\n\n`;
          }
          default: {
            return `Resolver for type ${linkedItem?.system.type} not implemented.\n\n`;
          }
        }
      },
    },
    marks: {
      contentItemLink: ({ children, value }) => {
        return `[${children}](https://website.com/${value.contentItemLink._ref})`;
      },
    },
  },
};

const resolvedMarkdown = toMarkdown(portableText, resolvers);
```

[npm-shield]: https://img.shields.io/npm/v/@kontent-ai/rich-text-resolver-markdown?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/kontent-ai/rich-text-resolver-js?label=license&style=for-the-badge
[license-url]: https://github.com/kontent-ai/rich-text-resolver-js/blob/main/LICENSE
[stack-shield]: https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white&style=for-the-badge
[discord-shield]: https://img.shields.io/discord/821885171984891914?label=Discord&logo=Discord&logoColor=white&style=for-the-badge

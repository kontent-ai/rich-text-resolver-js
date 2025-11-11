# @kontent-ai/rich-text-resolver-vue

[![npm version][npm-shield]](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-vue)
[![MIT License][license-shield]][license-url]
[![Stack Overflow][stack-shield]](https://stackoverflow.com/tags/kontent-ai)
[![Discord][discord-shield]](https://discord.gg/SKCxwPtevJ)

> [!NOTE]
> This is part of the [@kontent-ai/rich-text-resolver](../../README.md) monorepo.
> For general information and other packages, see the [main README](../../README.md).
>
> **Requires:** [@kontent-ai/rich-text-resolver](../rich-text-resolver) and `vue` as peer dependencies

Vue composables and helpers for resolving Kontent.ai rich text. This package provides helper functions for resolving tables and images in Vue components, designed to work seamlessly with `@portabletext/vue`.

## Installation

```bash
npm i --save @kontent-ai/rich-text-resolver-vue
npm i --save vue  # peer dependency (^3.5.0)
```

> [!NOTE]
> This package includes `@kontent-ai/rich-text-resolver-html` as a dependency.

## Examples

### Vue Resolution

Using `@portabletext/vue` package with Kontent.ai-specific helpers:

```ts
<script setup>
import {
  PortableText,
  PortableTextComponentProps,
  PortableTextComponents,
  toPlainText,
} from "@portabletext/vue";
import {
  resolveTableVue as resolveTable,
  resolveImageVue as resolveImage,
  toVueImageDefault,
} from "@kontent-ai/rich-text-resolver";


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

[npm-shield]: https://img.shields.io/npm/v/@kontent-ai/rich-text-resolver-vue?style=for-the-badge
[license-shield]: https://img.shields.io/github/license/kontent-ai/rich-text-resolver-js?label=license&style=for-the-badge
[license-url]: https://github.com/kontent-ai/rich-text-resolver-js/blob/main/LICENSE
[stack-shield]: https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white&style=for-the-badge
[discord-shield]: https://img.shields.io/discord/821885171984891914?label=Discord&logo=Discord&logoColor=white&style=for-the-badge

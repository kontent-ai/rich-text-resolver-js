# @kontent-ai/rich-text-resolver-vue

[![npm version](https://img.shields.io/npm/v/@kontent-ai/rich-text-resolver-vue?style=flat-square)](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-vue)
[![npm downloads](https://img.shields.io/npm/dt/@kontent-ai/rich-text-resolver-vue?style=flat-square)](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-vue)

> **Note:** This is part of the [@kontent-ai/rich-text-resolver](../../README.md) monorepo.
> For general information and other packages, see the [main README](../../README.md).
>
> **Requires:** [@kontent-ai/rich-text-resolver](../rich-text-resolver) and `vue` as peer dependencies

Vue composables and helpers for resolving Kontent.ai rich text. This package provides helper functions for resolving tables and images in Vue components, designed to work seamlessly with `@portabletext/vue`.

## Installation

```bash
npm i @kontent-ai/rich-text-resolver-vue
npm i vue  # peer dependency (^3.5.0)
```

**Note:** This package includes `@kontent-ai/rich-text-resolver-html` as a dependency.

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

## License

MIT - See [LICENSE](../../LICENSE) for details.

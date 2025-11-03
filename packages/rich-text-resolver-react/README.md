# @kontent-ai/rich-text-resolver-react

[![npm version](https://img.shields.io/npm/v/@kontent-ai/rich-text-resolver-react?style=flat-square)](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-react)
[![npm downloads](https://img.shields.io/npm/dt/@kontent-ai/rich-text-resolver-react?style=flat-square)](https://www.npmjs.com/package/@kontent-ai/rich-text-resolver-react)

> **Note:** This is part of the [@kontent-ai/rich-text-resolver](../../README.md) monorepo.
> For general information and other packages, see the [main README](../../README.md).
>
> **Requires:** [@kontent-ai/rich-text-resolver](../rich-text-resolver) and `react` as peer dependencies

React components and helpers for resolving Kontent.ai rich text. This package provides a modified `PortableText` component with enhanced support for Kontent.ai-specific elements and built-in components for common use cases.

## Installation

```bash
npm i @kontent-ai/rich-text-resolver-react
npm i @kontent-ai/rich-text-resolver  # peer dependency
npm i react  # peer dependency (>=18.0.0)
```

## Features

- Modified `<PortableText>` component from `@portabletext/react` with Kontent.ai-specific defaults
- Built-in `<TableComponent>` with default table resolution
- Built-in `<ImageComponent>` with default image resolution

## Examples

### React Resolution

React resolution using a slightly modified version of `PortableText` component from `@portabletext/react` package.

```tsx
import {
  PortableTextReactResolvers,
  PortableText,
  TableComponent,
  ImageComponent,
} from "@kontent-ai/rich-text-resolver-react";
import {
  transformToPortableText,
} from "@kontent-ai/rich-text-resolver";

// assumes richTextElement from SDK

const resolvers: PortableTextReactResolvers = {
  types: {
    componentOrItem: ({ value }) => {
      const item = richTextElement.linkedItems.find(item => item.system.codename === value?.componentOrItem._ref);
      return <div>{item?.elements.text_element.value}</div>;
    },
    // Image and Table components are used as a default fallback if a resolver isn't explicitly specified
    table: ({ value }) => <TableComponent {...value} />,
    image: ({ value }) => <ImageComponent {...value} />,
  },
  marks: {
    link: ({ value, children }) => {
      return (
        <a href={value?.href} rel={value?.rel} title={value?.title} data-new-window={value?.['data-new-window']}>
          {children}
        </a>
      )
    },
    contentItemLink: ({ value, children }) => {
      const item = richTextElement.linkedItems.find(item => item.system.id === value?.contentItemLink._ref);
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
  const portableText = transformToPortableText(props.element.value);

  return (
    <PortableText value={portableText} components={resolvers} />
  );
};
```

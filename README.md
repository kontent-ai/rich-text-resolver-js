# Kontent.ai rich text transformer

> :information_source: This module is in experimental mode and may undergo changes in the future.

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

`npm i @pokornyd/kontent-ai-rich-text-parser`

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
- Vue: [sanity-blocks-vue-component](https://github.com/rdunk/sanity-blocks-vue-component)

Resolution is described in each corresponding repository. You can also find example resolution below.

### Custom portable text blocks

Besides default blocks for common elements, Portable text supports custom blocks, which can represent other (not only) HTML entities. Each custom block should extend `IPortableTextBaseItem` to ensure `_key` and `_type` properties are present. Key should be a unique identifier (e.g. guid), while type should point out what said custom block represents. Value of `_type` property is used for subsequent override for resolution purposes. **This package comes with built-in custom block definitions for representing Kontent.ai-specific objects:**

#### Component/linked item

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L3-L10

#### Image

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L12-L20

#### Item link

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L22-L29

#### Table

https://github.com/kontent-ai/rich-text-resolver-js/blob/14dcf88e5cb5233b1ff529b350341dfac79a888b/showcase/showcase.ts#L31-L58

<br>

> 💡 For table resolution, you may use `resolveTable` helper function. It accepts two arguments -- custom block of type `table` and a method to transform content of its cells into valid HTML. See below for usage examples. Alternatively, you can iterate over the table structure and resolve it as per your requirements (e.g. if you want to add CSS classes to its elements)

## Examples

HTML resolution using `@portabletext/to-html` package.

```ts
import { escapeHTML, PortableTextOptions, toHTML } from "@portabletext/to-html";
import {
  browserParse,
  transformToPortableText,
  resolveTable,
} from "@pokornyd/kontent-ai-rich-text-parser";

const richTextValue = "<rich text html>";
const linkedItems = ["<array of linked items>"];
const parsedTree = browserParse(richTextValue);
const portableText = transformToPortableText(parsedTree);

const portableTextComponents: PortableTextOptions = {
  components: {
    types: {
      image: ({ value }) => {
        return `<img src="${value.asset.url}"></img>`;
      },
      component: ({ value }) => {
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
      table: ({ value }) => {
        const tableHtml = resolveTable(value, toHTML); // helper method for resolving tables
        return tableHtml;
      },
    },
    marks: {
      internalLink: ({ children, value }) => {
        return `\<a href=\"https://website.com/${value.reference._ref}">${children}</a>`;
      },
      link: ({ children, value }) => {
        return `\<a href=${value?.href} target=${target} rel=${value?.rel} title=${value?.title} data-new-window=${value["data-new-window"]}>${children}</a>`;
      },
    },
  },
};

const resolvedHtml = toHTML(portableText, portableTextComponents);
```

React, using `@portabletext/react` package.

```tsx
import { PortableText, toPlainText } from "@portabletext/react";
import {
  nodeParse,
  resolveTable,
  transformToPortableText,
} from "@pokornyd/kontent-ai-rich-text-parser";

const richTextValue = "<rich text html>";
const linkedItems = ["<array of linked items>"];
const parsedTree = browserParse(richTextValue);
const portableText = transformToPortableText(parsedTree);

interface IMyComponentProps {
  value: IPortableTextItem[];
  components: Partial<PortableTextReactComponents>;
}

const portableTextComponents: Partial<PortableTextReactComponents> = {
  types: {
    component: (block) => {
      const item = linkedItems.find(
        (item) => item.system.codename === block.value.component._ref
      );
      return <div>{item?.elements.text_element.value}</div>;
    },
    table: ({ value }) => {
      const table = (
        <table>
          {value.rows.map((row) => (
            <tr>
              {row.cells.map((cell) => {
                return (
                  <td>
                    <PortableText
                      value={cell.content}
                      components={portableTextComponents}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </table>
      );
      return table;
    },
    image: ({ value }) => {
      return <img src={value.asset.url}></img>;
    },
  },
  marks: {
    link: ({ value, children }) => {
      const target = (value?.href || "").startsWith("http")
        ? "_blank"
        : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={value?.rel}
          title={value?.title}
          data-new-window={value["data-new-window"]}
        >
          {children}
        </a>
      );
    },
    internalLink: ({ value, children }) => {
      const item = linkedItems.find(
        (item) => item.system.id === value.reference._ref
      );
      return (
        <a href={"https://somerandomwebsite.xyz/" + item?.system.codename}>
          {children}
        </a>
      );
    },
  },
};

export const MyComponent = ({ value, components }: IMyComponentProps) => {
  return <PortableText value={value} components={components} />;
};
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

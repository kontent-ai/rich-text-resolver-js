import type { PortableTextBlock, TypedObject } from "@kontent-ai/rich-text-resolver";
import { PortableText as PortableTextDefault, type PortableTextProps } from "@portabletext/react";
// biome-ignore lint/correctness/noUnusedImports: React env neede for jsx
import React, { type JSX } from "react";
import { ImageComponent } from "./components/image.js";
import { TableComponent } from "./components/table.js";
import type { PortableTextReactResolvers } from "./types.js";

export const kontentDefaultComponentResolvers: PortableTextReactResolvers = {
  types: {
    image: ({ value }) => <ImageComponent {...value} />,
    table: ({ value }) => <TableComponent {...value} />,
  },
  marks: {
    link: ({ value, children }) => {
      if (!value) {
        throw new Error("Error rendering link mark: Missing link value data.");
      }

      const { _key, _type, ...attributes } = value;
      return <a {...attributes}>{children}</a>;
    },
    sup: ({ children }) => <sup>{children}</sup>,
    sub: ({ children }) => <sub>{children}</sub>,
  },
};

/**
 * Wrapper around `PortableText` component from `@portabletext/react` package, with default resolvers for `sup` and `sub` marks added.
 *
 * @param param0 see `PortableTextProps` from `@portabletext/react` package
 * @returns JSX element
 */
export const PortableText = <B extends TypedObject = PortableTextBlock>({
  value: input,
  components: componentOverrides,
  listNestingMode,
  onMissingComponent: missingComponentHandler,
}: PortableTextProps<B>): JSX.Element => {
  const mergedComponentResolvers: PortableTextReactResolvers = {
    ...componentOverrides,
    types: {
      ...kontentDefaultComponentResolvers.types,
      ...componentOverrides?.types,
    },
    marks: {
      ...kontentDefaultComponentResolvers.marks,
      ...componentOverrides?.marks,
    },
  };

  return (
    <PortableTextDefault
      value={input}
      components={mergedComponentResolvers}
      listNestingMode={listNestingMode}
      onMissingComponent={missingComponentHandler}
    />
  );
};

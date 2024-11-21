import { PortableTextMarkComponent, PortableTextReactComponents, PortableTextTypeComponent } from "@portabletext/react";

import {
  PortableTextComponentOrItem,
  PortableTextExternalLink,
  PortableTextImage,
  PortableTextItemLink,
  PortableTextTable,
} from "../../transformers/transformer-models.js";

type RichTextCustomBlocks = {
  image: PortableTextTypeComponent<PortableTextImage>;
  componentOrItem: PortableTextTypeComponent<PortableTextComponentOrItem>;
  table: PortableTextTypeComponent<PortableTextTable>;
};

type RichTextCustomMarks = {
  contentItemLink: PortableTextMarkComponent<PortableTextItemLink>;
  link: PortableTextMarkComponent<PortableTextExternalLink>;
};

/**
 * Extends `PortableTextReactComponents` type from `@portabletext/react` package with
 * pre-defined types for resolution of Kontent.ai specific custom objects.
 */
export type PortableTextReactResolvers = Partial<
  Omit<
    PortableTextReactComponents,
    "types" | "marks"
  > & {
    types: PortableTextReactComponents["types"] & Partial<RichTextCustomBlocks>;
    marks: PortableTextReactComponents["marks"] & Partial<RichTextCustomMarks>;
  }
>;

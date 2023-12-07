import {
  ArbitraryTypedObject,
  PortableTextBlock,
  PortableTextListItemBlock,
  PortableTextMarkDefinition,
  PortableTextSpan,
} from "@portabletext/types";

/**
 * Represents a content item linked to from rich text (not a linked item).
 */
export interface Reference extends ArbitraryTypedObject {
  _type: "reference";
  /**
   * Holds an ID of the item being linked to.
   */
  _ref: string;
}

/**
 * Represents an asset object used in rich text.
 */
export interface AssetReference extends Reference {
  /**
   * URL of an asset.
   */
  url: string;
  /**
   * Alternate image text.
   */
  alt: string;
}

/**
 * Represents a mark definition for a link to an external URL in rich text element.
 */
export interface PortableTextExternalLink extends PortableTextMarkDefinition {
  _type: "link";
  href?: string;
  rel?: string;
  title?: string;
}

/**
 * Represents a mark definition for a link to a content item in rich text element.
 */
export interface PortableTextInternalLink extends PortableTextMarkDefinition {
  _type: "internalLink";
  reference: Reference;
}

/**
 * Represents an inline image used in rich text element.
 */
export interface PortableTextImage extends ArbitraryTypedObject {
  _type: "image";
  /**
   * Reference to an asset used in rich text.
   */
  asset: AssetReference;
}

/**
 * Represents a table in rich text element.
 */
export interface PortableTextTable extends ArbitraryTypedObject {
  _type: "table";
  /**
   * The number of columns the table has.
   */
  numColumns: number;
  /**
   * Array of table row objects.
   */
  rows: PortableTextTableRow[];
}

/**
 * Represents a single row of cells in a portable text table.
 */
export interface PortableTextTableRow extends ArbitraryTypedObject {
  _type: "row";
  /**
   * Array of table cells.
   */
  cells: PortableTextTableCell[];
}

/**
 * Represents a single cell in a portable text table.
 */
export interface PortableTextTableCell extends ArbitraryTypedObject {
  _type: "cell";
  /**
   * Number of blocks that belong to a table cell.
   * Helps with table resolution.
   */
  childBlocksCount: number;
  /**
   * All blocks belonging to a cell.
   */
  content: PortableTextBlock[];
}

/**
 * Represents a component or a linked item used in rich text.
 */
export interface PortableTextComponent extends ArbitraryTypedObject {
  _type: "component";
  /**
   * Reference to a component or a linked item.
   */
  component: Reference;
}

/**
 * Represents a mark that styles the text (`strong`, `em`, etc.)
 */
export interface PortableTextStyleMark extends ArbitraryTypedObject {
  _type: "mark";
  value: "strong" | "em" | "sub" | "sup" | "code"; // TODO: formerly TextStyleElement, is circular import okay in this case?
}

/**
 * Represents a mark that references a link type object in `markDefs` array via a guid.
 */
export interface PortableTextLinkMark extends ArbitraryTypedObject {
  _type: "linkMark";
  /**
   * Short guid pointing to a corresponding object in `markDefs` array.
   */
  value: string;
  /**
   * Number of spans the link extends to.
   *
   * This is required for merging process as one link can potentially have multiple spans,
   * in case parts of the link text are styled.
   */
  childCount: number;
}

/**
 * Represents a block, usually a paragraph or heading.
 *
 * Narrows the `_type` to `block` for type guard purposes.
 */
export interface PortableTextStrictBlock
  extends Omit<PortableTextBlock, "_type">, ArbitraryTypedObject {
  _type: "block";
}

/**
 * Represents a list item block. Similar to regular block but requires `listItem` property.
 *
 * Narrows the `_type` to `block` for type guard purposes.
 */
export interface PortableTextStrictListItemBlock
  extends Omit<PortableTextListItemBlock, "_type">, ArbitraryTypedObject {
  _type: "block";
}

export type PortableTextLink =
  | PortableTextInternalLink
  | PortableTextExternalLink;

export type PortableTextMark = PortableTextLinkMark | PortableTextStyleMark;

/**
 * Union of all default, top-level portable text object types.
 */
export type PortableTextObject =
  | PortableTextComponent
  | PortableTextImage
  | PortableTextTable
  | PortableTextStrictBlock
  | PortableTextStrictListItemBlock;


/**
 * Union of all nested portable text object types.
 */
export type PortableTextInternalObject =
  | Reference
  | PortableTextMark
  | PortableTextLink
  | PortableTextTableRow
  | PortableTextTableCell
  | PortableTextSpan;

/**
 * Union of all default portable text object types.
 */
export type PortableTextItem = PortableTextObject | PortableTextInternalObject;


/**
 * Re-exports all types from the package, to allow both custom types and
 * predefined types to be imported from a single point via "exports" in package.json.
 */
export * from "@portabletext/types";


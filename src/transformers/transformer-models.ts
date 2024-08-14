import {
  ArbitraryTypedObject,
  PortableTextBlock,
  PortableTextListItemBlock,
  PortableTextMarkDefinition,
  PortableTextSpan,
} from "@portabletext/types";
import {
  textStyleElements,
  blockElements,
  ignoredElements,
  markElements,
  allElements,
} from "../index.js";

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
  alt?: string;
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
   * `component` for components or `item | link` for linked items
   */
  dataType: ModularContentType;
  /**
   * Reference to a component or a linked item.
   */
  component: Reference;
}

/**
 * Represents either a style (strong, em, etc.) or references a link object in markDefs array
 */
export interface PortableTextMark extends ArbitraryTypedObject {
  _type: "mark";
  value: TextStyleElement | ShortGuid;
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
 * `link` and `item` represent a rich text linked item
 * in delivery and management API respectively
 */
type DeliveryLinkedItem = "link";
type ManagementLinkedItem = "item";

/**
 * `component` represents a rich text inline component
 */
export type ModularContentType = "component" | DeliveryLinkedItem | ManagementLinkedItem;


/**
 * Re-exports all types from the package, to allow both custom types and
 * predefined types to be imported from a single point via "exports" in package.json.
 */
export * from "@portabletext/types";

export type TextStyleElement = typeof textStyleElements[number];
export type BlockElement = typeof blockElements[number];
export type IgnoredElement = typeof ignoredElements[number];
export type MarkElement = typeof markElements[number];
export type ValidElement = typeof allElements[number];
export type ShortGuid = string;

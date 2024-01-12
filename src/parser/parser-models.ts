/**
 * Union type of tags and text nodes.
 */
export type DomNode = DomHtmlNode | DomTextNode;

/**
 * Represents a text node.
 */
export interface DomTextNode {
  type: "text";
  /**
   * Text content.
   */
  content: string;
}

/**
 * Represents a HTML tag.
 */
export interface DomHtmlNode {
  type: "tag";
  /**
   * Name of the HTML tag.
   */
  tagName: string;
  /**
   * Record of all the HTML tag's attributes and their values.
   */
  attributes: Record<string, string>;
  /**
   * Array of childnodes.
   */
  children: DomNode[];
}

/**
 * A tree structure representing a result of the `parse` method.
 */
export interface ParseResult {
  children: DomNode[];
}

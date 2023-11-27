/**
 * Union type of tags and text nodes.
 */
export type IDomNode = IDomHtmlNode | IDomTextNode;

/**
 * Represents a text node.
 */
export interface IDomTextNode {
  type: "text";
  /**
   * Text content.
   */
  content: string;
}

/**
 * Represents a HTML tag.
 */
export interface IDomHtmlNode {
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
  children: IDomNode[];
}

/**
 * A tree structure representing a result of the `parse` method.
 */
export interface IOutputResult {
  children: IDomNode[];
}

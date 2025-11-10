import type {
  PortableTextComponentOrItem,
  PortableTextExternalLink,
  PortableTextImage,
  PortableTextItemLink,
  PortableTextObject,
  PortableTextTable,
  PortableTextTableCell,
  PortableTextTableRow,
} from "@kontent-ai/rich-text-resolver";
import {
  type PortableTextHtmlComponents,
  type PortableTextMarkComponent,
  type PortableTextOptions,
  type PortableTextTypeComponent,
  toHTML as toHTMLDefault,
} from "@portabletext/to-html";

type RichTextCustomBlocks = Partial<{
  image: PortableTextTypeComponent<PortableTextImage>;
  componentOrItem: PortableTextTypeComponent<PortableTextComponentOrItem>;
  table: PortableTextTypeComponent<PortableTextTable>;
}>;

type RichTextCustomMarks = Partial<{
  contentItemLink: PortableTextMarkComponent<PortableTextItemLink>;
  link: PortableTextMarkComponent<PortableTextExternalLink>;
}>;

type RichTextMarkdownComponents = Omit<PortableTextHtmlComponents, "types" | "marks"> & {
  types: PortableTextHtmlComponents["types"] & RichTextCustomBlocks;
  marks: PortableTextHtmlComponents["marks"] & RichTextCustomMarks;
};

/**
 * Extends `PortableTextOptions` type from `toHTML` package with
 * pre-defined types for resolution of Kontent.ai specific custom objects to Markdown.
 */
export type PortableTextMarkdownResolvers = Omit<PortableTextOptions, "components"> & {
  components: Partial<RichTextMarkdownComponents>;
};

const compose = (arr: ReadonlyArray<(str: string) => string>) => (text: string) =>
  arr.reduce((prev, curr) => curr(prev), text);

const listResolver = (level: number, index: number) =>
  compose([
    (str) => (level === 1 && index === 0 ? str.trimStart() : str),
    (str) => (level === 1 ? `${str}\n\n` : str),
  ]);

export const sanitizeWhiteSpaces = (str: string, mark: string): string => {
  // Normalize all non-breaking spaces to regular spaces
  const normalized = str.replace(/&nbsp;/g, " ");

  const start = normalized.search(/\S/); // index of first non-space
  if (start === -1) {
    return normalized;
  }

  const end = normalized.trimEnd().length;
  return `${" ".repeat(start)}${mark}${normalized.slice(start, end).trim()}${mark}${" ".repeat(normalized.length - end)}`;
};

const markdownComponentResolvers = {
  components: {
    block: {
      h1: ({ children }) => `# ${children}\n\n`,
      h2: ({ children }) => `## ${children}\n\n`,
      h3: ({ children }) => `### ${children}\n\n`,
      h4: ({ children }) => `#### ${children}\n\n`,
      h5: ({ children }) => `##### ${children}\n\n`,
      h6: ({ children }) => `###### ${children}\n\n`,
      normal: ({ children }) => `${children}\n\n`,
    },
    list: {
      bullet: ({ children, value, index }) => listResolver(value.level, index)(children ?? ""),
      number: ({ children, value, index }) => listResolver(value.level, index)(children ?? ""),
    },
    listItem: {
      bullet: ({ children, value }) => `\n${"   ".repeat((value.level ?? 1) - 1)}- ${children}`,
      number: ({ children, value }) => `\n${"   ".repeat((value.level ?? 1) - 1)}1. ${children}`,
    },
    types: {
      image: ({ value }) => `![${value.asset.alt ?? ""}](${value.asset.url})\n\n`,
      table: ({ value }) => resolveTableToMarkdown(value),
    },
    marks: {
      strong: ({ children }) => sanitizeWhiteSpaces(children, "**"),
      em: ({ children }) => sanitizeWhiteSpaces(children, "_"),
      code: ({ children }) => `\`${children}\``,
      link: ({ value, children }) => {
        if (!value) {
          throw new Error("Error rendering link mark: Missing link value data.");
        }
        return `[${children}](${value.href})`;
      },
      sup: ({ children }) => `<sup>${children}</sup>`,
      sub: ({ children }) => `<sub>${children}</sub>`,
    },
  },
} as const satisfies PortableTextMarkdownResolvers;

const markdownTableComponentResolvers: PortableTextMarkdownResolvers = {
  components: {
    block: {
      h1: ({ children }) => `# ${children}`,
      h2: ({ children }) => `## ${children}`,
      h3: ({ children }) => `### ${children}`,
      h4: ({ children }) => `#### ${children}`,
      h5: ({ children }) => `##### ${children}`,
      h6: ({ children }) => `###### ${children}`,
      normal: ({ children }) => `${children}`,
    },
    types: {
      image: markdownComponentResolvers.components.types.image,
    },
    marks: markdownComponentResolvers.components.marks,
  },
};

const resolveTableToMarkdown = (
  table: PortableTextTable,
  resolver: typeof toMarkdown = toMarkdown,
): string => {
  const renderCell = (cell: PortableTextTableCell) => {
    const cellContent =
      cell.content.length > 1
        ? toHTMLDefault(cell.content)
        : resolver(cell.content, markdownTableComponentResolvers);
    return `| ${cellContent} `;
  };

  const renderRow = (row: PortableTextTableRow) => {
    const cells = row.cells.map(renderCell);
    return `${cells.join("")}|\n`;
  };

  const markdown = table.rows.reduce((acc, row, index) => {
    if (index === 0) {
      const separatorCells = row.cells.map(() => "| --- ");
      return `${renderRow(row)}${separatorCells.join("")}|\n`;
    }
    return acc + renderRow(row);
  }, "");

  return `${markdown}\n`;
};

/**
 * Converts array of Kontent.ai portable text objects to Markdown using HTML library with custom resolvers.
 *
 * @param blocks array of portable text objects
 * @param resolvers optional custom resolvers for Portable Text objects
 * @returns Markdown string
 */
export const toMarkdown = (
  blocks: PortableTextObject[],
  resolvers?: PortableTextMarkdownResolvers,
): string => {
  const mergedComponentResolvers = {
    ...resolvers?.components,
    block: {
      ...markdownComponentResolvers.components.block,
      ...resolvers?.components.block,
    },
    list: {
      ...markdownComponentResolvers.components.list,
      ...resolvers?.components.list,
    },
    listItem: {
      ...markdownComponentResolvers.components.listItem,
    },
    ...resolvers?.components.listItem,
    types: {
      ...markdownComponentResolvers.components.types,
      ...resolvers?.components.types,
    },
    marks: {
      ...markdownComponentResolvers.components.marks,
      ...resolvers?.components.marks,
    },
  };

  return toHTMLDefault(blocks, { components: mergedComponentResolvers });
};

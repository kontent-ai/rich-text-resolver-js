import type {
  PortableTextObject,
  PortableTextTable,
  PortableTextTableCell,
  PortableTextTableRow,
} from "@kontent-ai/rich-text-resolver";
import { toHTML } from "@kontent-ai/rich-text-resolver-html";
import type { h } from "vue";

/**
 * Renders a portable text table to a Vue virtual DOM node.
 *
 * @param {PortableTextTable} table - The portable text table object to render.
 * @param {typeof h} vueRenderFunction - A Vue render function, typically the `h` function from Vue.
 * @param {(value: PortableTextBlock[]) => string} resolver - A function that resolves
 *        the content of each cell in the table.
 * @returns {VueNode} The rendered table as a Vue virtual DOM node.
 */
export const resolveTable = (
  table: PortableTextTable,
  vueRenderFunction: typeof h,
  resolver: (value: PortableTextObject[]) => string = toHTML,
) => {
  const renderCell = (cell: PortableTextTableCell) => {
    const cellContent = resolver(cell.content);
    return vueRenderFunction("td", {}, cellContent);
  };

  const renderRow = (row: PortableTextTableRow) => {
    const cells = row.cells.map(renderCell);
    return vueRenderFunction("tr", {}, cells);
  };

  const renderRows = () => table.rows.map(renderRow);

  return vueRenderFunction("table", {}, renderRows());
};

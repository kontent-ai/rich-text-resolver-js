import type {
  PortableTextTable,
  PortableTextTableCell,
  PortableTextTableRow,
} from "@kontent-ai/rich-text-resolver";
import { toPlainText } from "@portabletext/react";
import React from "react";

export const TableComponent: React.FC<PortableTextTable> = (table) => {
  const renderCell = (cell: PortableTextTableCell, cellIndex: number) => {
    return <td key={cellIndex}>{toPlainText(cell.content)}</td>;
  };

  const renderRow = (row: PortableTextTableRow, rowIndex: number) => {
    return <tr key={rowIndex}>{row.cells.map(renderCell)}</tr>;
  };

  return (
    <table>
      <tbody>{table.rows.map(renderRow)}</tbody>
    </table>
  );
};

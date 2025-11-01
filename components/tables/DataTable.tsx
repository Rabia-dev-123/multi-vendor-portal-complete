import React, { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  minWidth?: string;
}

export default function DataTable<T extends { id: number }>({
  data,
  columns,
  emptyMessage = "No data found",
  minWidth = "1102px",
}: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <div className="max-w-full overflow-x-auto">
        <div style={{ minWidth }}>
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                {columns.map((column, index) => (
                  <TableCell
                    key={index}
                    isHeader
                    className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${
                      column.headerClassName || ""
                    }`}
                  >
                    {column.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {data.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {emptyMessage}
                  </td>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    {columns.map((column, index) => (
                      <TableCell
                        key={index}
                        className={`px-5 py-4 text-start ${
                          column.className ||
                          "text-gray-500 text-theme-sm dark:text-gray-400"
                        }`}
                      >
                        {column.cell
                          ? column.cell(row)
                          : column.accessor
                          ? String(row[column.accessor] ?? "-")
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

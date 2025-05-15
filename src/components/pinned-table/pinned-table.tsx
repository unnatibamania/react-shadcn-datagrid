import * as React from "react";
import { motion } from "framer-motion";
import { ColumnConfig, CellValue } from "../../types/column";
import { cn } from "../../lib/utils";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
} from "../ui/table";

import { Checkbox } from "../ui/checkbox";

import type { DataGridClassNames } from "../../types/data-grid";
import { TextCell } from "../cells/text-cell";
import { NumberCell } from "../cells/number-cell";
import { BooleanCell } from "../cells/boolean-cell";
import { DateCell } from "../cells/date-cell";
import { SelectCell } from "../cells/select-cell";
import { MultiSelectCell } from "../cells/multi-select-cell";
import { ToggleCell } from "../cells/toggle-cell";
import { RatingCell } from "../cells/rating-cell";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { EditColumnForm } from "../data-grid/edit-column-form";
import { ColumnActionsMenu } from "../data-grid/column-actions-menu";

// Create motion components
const MotionTableHead = motion(TableHead);
const MotionTableCell = motion(TableCell);

interface PinnedTableProps<
  T extends { id: string | number; [key: string]: CellValue }
> {
  pinnedColumns: ColumnConfig<T>[];
  rows: T[];
  classNames?: DataGridClassNames;
  columnWidths: Record<string, number>;
  selectedRowIds: Set<string | number>;
  handleSave: (
    rowId: string | number,
    columnId: string,
    newValue: unknown
  ) => void;
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void;
  onColumnDelete?: (columnId: string) => void;
  enableRowSelection: boolean;
  pinnedColumnsState: Record<string, boolean>;
  setPinnedColumns: (pinnedColumns: Record<string, boolean>) => void;
  headerCheckboxState: boolean | "indeterminate";
  handleSelectRow: (
    rowId: string | number,
    checked: boolean | "indeterminate"
  ) => void;
  handleSelectAll: (checked: "indeterminate" | boolean) => void;
}

export function PinnedTable<
  T extends { id: string | number; [key: string]: CellValue }
>({
  pinnedColumns,
  rows,
  classNames,
  columnWidths,
  selectedRowIds,
  handleSave,
  onColumnChange,
  onColumnDelete,
  pinnedColumnsState,
  setPinnedColumns,
  enableRowSelection,
  headerCheckboxState,
  handleSelectAll,
  handleSelectRow,
}: PinnedTableProps<T>) {
  const [editingColumn, setEditingColumn] =
    React.useState<ColumnConfig<T> | null>(null);

  const totalPinnedWidth = pinnedColumns.reduce((total, col) => {
    const width = columnWidths[col.id] || col.minWidth || 150;
    return total + width;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      layout
      className="absolute top-0 z-30 left-0 h-full bg-background shadow-md overflow-hidden"
      style={{ width: `${totalPinnedWidth}px` }}
    >
      <Table
        suppressHydrationWarning
        className={cn(
          "border-collapse shadow-md table-fixed",
          classNames?.table
        )}
        style={{ width: `${totalPinnedWidth}px` }}
      >
        <TableHeader>
          <TableRow
            className={cn(
              "bg-muted hover:bg-muted/80",
              classNames?.header?.row
            )}
          >
            {enableRowSelection && (
              <TableHead
                style={{ width: "50px", minWidth: "50px" }}
                className={cn("relative p-0", classNames?.header?.cell)}
              >
                <div className="flex items-center justify-center h-full">
                  <Checkbox
                    checked={headerCheckboxState}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                    className={cn(classNames?.components?.checkbox)}
                  />
                </div>
              </TableHead>
            )}
            {pinnedColumns.map((column) => {
              const width = columnWidths[column.id] || column.minWidth || 150;
              return (
                <MotionTableHead
                  layout="position"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: `${width}px`,
                    minWidth: `${column.minWidth || 0}px`,
                    maxWidth: `${column.maxWidth || "none"}px`,
                  }}
                  className={cn("group relative", classNames?.header?.cell)}
                  key={column.id}
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center flex-grow overflow-hidden mr-1">
                      {column.icon ? (
                        <div className="mr-2 flex-shrink-0">{column.icon}</div>
                      ) : null}
                      <span className="truncate">{column.header}</span>
                    </div>
                    <div className="flex items-center flex-shrink-0 ml-1">
                      <ColumnActionsMenu
                        column={column}
                        onColumnChange={onColumnChange}
                        onColumnDelete={onColumnDelete}
                        setIsEditingColumn={() => setEditingColumn(column)}
                        pinnedColumns={pinnedColumnsState}
                        setPinnedColumns={setPinnedColumns}
                        stopPropagation={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </MotionTableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody className={cn(classNames?.body?.wrapper)}>
          {rows.map((row, rowIndex) => {
            const isSelected = selectedRowIds.has(row.id);
            return (
              <TableRow
                key={row.id}
                data-state={isSelected ? "selected" : ""}
                className={cn(
                  "h-[53px] transition-all duration-300",
                  classNames?.body?.row,
                  isSelected && classNames?.body?.selectedRow
                )}
              >
                {enableRowSelection && (
                  <TableCell className={cn("p-0", classNames?.body?.cell)}>
                    <div className="flex items-center justify-center h-full">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectRow(row.id, checked)
                        }
                        aria-label={`Select row ${rowIndex + 1}`}
                        className={cn(classNames?.components?.checkbox)}
                      />
                    </div>
                  </TableCell>
                )}
                {pinnedColumns.map((column) => {
                  const initialValue = row[column.id];
                  const width =
                    columnWidths[column.id] || column.minWidth || 150;
                  const cellStyle: React.CSSProperties = {
                    width: `${width}px`,
                    minWidth: column.minWidth
                      ? `${column.minWidth}px`
                      : undefined,
                    maxWidth: column.maxWidth
                      ? `${column.maxWidth}px`
                      : undefined,
                  };
                  return (
                    <MotionTableCell
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                      key={column.id}
                      style={cellStyle}
                      className={cn(
                        "overflow-hidden whitespace-nowrap bg-zinc-50/50 text-ellipsis align-middle",
                        classNames?.body?.cell
                      )}
                    >
                      {column.type === "text" ? (
                        <TextCell
                          initialValue={String(initialValue ?? "")}
                          onSave={(newValue: string) =>
                            handleSave(row.id, column.id, newValue)
                          }
                        />
                      ) : column.type === "number" ? (
                        <NumberCell
                          initialValue={
                            typeof initialValue === "number"
                              ? initialValue
                              : null
                          }
                          onSave={(newValue: number | null) =>
                            handleSave(row.id, column.id, newValue)
                          }
                        />
                      ) : column.type === "boolean" ||
                        column.type === "checkbox" ? (
                        <BooleanCell
                          initialValue={
                            typeof initialValue === "boolean"
                              ? initialValue
                              : null
                          }
                          isEditable={column.isEditable}
                          onSave={(newValue: boolean) =>
                            handleSave(rowIndex, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : column.type === "date" ? (
                        <DateCell
                          initialValue={
                            initialValue instanceof Date ? initialValue : null
                          }
                          isEditable={column.isEditable}
                          onSave={(newValue: Date | null) =>
                            handleSave(rowIndex, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : column.type === "select" ? (
                        <SelectCell
                          initialValue={
                            typeof initialValue === "string"
                              ? initialValue
                              : null
                          }
                          options={column.selectOptions || []}
                          isEditable={column.isEditable}
                          onSave={(newValue: string | null) =>
                            handleSave(row.id, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : column.type === "multi-select" ? (
                        <MultiSelectCell
                          initialValues={
                            Array.isArray(initialValue)
                              ? initialValue.filter(
                                  (v): v is string => typeof v === "string"
                                )
                              : null
                          }
                          options={column.multiSelectOptions || []}
                          isEditable={column.isEditable}
                          onSave={(newValue: string[] | null) =>
                            handleSave(row.id, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : column.type === "toggle" ? (
                        <ToggleCell
                          initialValue={
                            typeof initialValue === "boolean"
                              ? initialValue
                              : null
                          }
                          isEditable={column.isEditable}
                          onSave={(newValue: boolean) =>
                            handleSave(row.id, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : column.type === "rating" ? (
                        <RatingCell
                          initialValue={
                            typeof initialValue === "number"
                              ? initialValue
                              : null
                          }
                          isEditable={column.isEditable}
                          onSave={(newValue: number | null) =>
                            handleSave(row.id, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : (
                        column.cell(row)
                      )}
                    </MotionTableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Dialog
        open={!!editingColumn}
        onOpenChange={(isOpen) => !isOpen && setEditingColumn(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          {editingColumn && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Edit Column:{" "}
                  {typeof editingColumn.header === "string"
                    ? editingColumn.header
                    : editingColumn.id}
                </DialogTitle>
              </DialogHeader>
              <EditColumnForm
                column={editingColumn}
                onSave={(updatedConfig) => {
                  if (onColumnChange) {
                    onColumnChange(updatedConfig);
                  }
                  setEditingColumn(null);
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

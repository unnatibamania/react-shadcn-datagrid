import * as React from "react";
import { TableBody, TableRow, TableCell } from "../ui/table";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";
import type { ColumnConfig, CellValue, RowAction } from "../../types/column";
import type { DataGridClassNames } from "../../types/data-grid";
// Import specific cell components as needed
import { TextCell } from "../cells/text-cell";
import { NumberCell } from "../cells/number-cell";
import { BooleanCell } from "../cells/boolean-cell";
import { DateCell } from "../cells/date-cell";
import { SelectCell } from "../cells/select-cell";
import { MultiSelectCell } from "../cells/multi-select-cell";
import { ToggleCell } from "../cells/toggle-cell";
import { RatingCell } from "../cells/rating-cell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";

// Define the props for DataGridBody
interface DataGridBodyProps<
  T extends { id: string | number; [key: string]: CellValue }
> {
  rows: T[];
  columns: ColumnConfig<T>[];
  selectedRowIds: Set<string | number>;
  handleSelectRow: (
    rowId: string | number,
    checked: boolean | "indeterminate"
  ) => void;
  handleSave: (rowIndex: number, columnId: string, newValue: unknown) => void;
  columnWidths: Record<string, number>;
  enableRowSelection: boolean;
  classNames?: DataGridClassNames;
  isLoading?: boolean;
  skeletonComponent?: React.ReactNode;
  pinnedColumnsData: ColumnConfig<T>[];
  rowActions?: RowAction<T>[];
}

export function DataGridBody<
  T extends { id: string | number; [key: string]: CellValue }
>({
  rows,
  columns,
  selectedRowIds,
  handleSelectRow,
  handleSave,
  columnWidths,
  enableRowSelection,
  classNames,
  isLoading,
  skeletonComponent,
  pinnedColumnsData,
  rowActions,
}: DataGridBodyProps<T>) {
  // Row rendering logic will go here
  return (
    <TableBody className={cn(classNames?.body?.wrapper)}>
      {isLoading
        ? skeletonComponent
        : rows.map((row, rowIndex) => {
            const isSelected = selectedRowIds.has(row.id);
            return (
              <TableRow
                key={row.id}
                data-state={isSelected ? "selected" : ""}
                className={cn(
                  "h-10 py-2",
                  classNames?.body?.row,
                  isSelected && classNames?.body?.selectedRow
                )}
              >
                {/* Selection Cell */}
                {enableRowSelection && pinnedColumnsData?.length === 0 && (
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

                {columns.map((column) => {
                  const initialValue = row[column.id];
                  const cellStyle: React.CSSProperties = {
                    width: columnWidths[column.id]
                      ? `${columnWidths[column.id]}px`
                      : undefined,
                    minWidth: column.minWidth
                      ? `${column.minWidth}px`
                      : undefined,
                    maxWidth: column.maxWidth
                      ? `${column.maxWidth}px`
                      : undefined,
                  };
                  return (
                    <TableCell
                      key={column.id}
                      style={cellStyle}
                      className={cn(
                        "overflow-hidden px-2   whitespace-nowrap bg-zinc-50/50 text-ellipsis align-middle",
                        classNames?.body?.cell
                      )}
                    >
                      {column.type === "text" ? (
                        <TextCell
                          initialValue={String(initialValue ?? "")}
                          onSave={(newValue: string) =>
                            handleSave(rowIndex, column.id, newValue)
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
                            handleSave(rowIndex, column.id, newValue)
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
                            handleSave(rowIndex, column.id, newValue)
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
                            handleSave(rowIndex, column.id, newValue)
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
                            handleSave(rowIndex, column.id, newValue)
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
                            handleSave(rowIndex, column.id, newValue)
                          }
                          classNames={classNames?.components}
                        />
                      ) : (
                        // Default case: Render directly, no extra div/padding needed
                        column.cell(row)
                      )}
                    </TableCell>
                  );
                })}

                {/* Actions Column Cell (conditionally rendered) */}
                {rowActions && rowActions.length > 0 && (
                  <TableCell
                    key="__actions_cell__"
                    style={{ width: "50px" }}
                    className={cn(
                      "sticky right-0 z-10 bg-zinc-50/50 p-0",
                      classNames?.body?.cell
                    )}
                  >
                    <div className="flex  h-full items-center justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                          >
                            {/* <span className="sr-only">Open row actions</span> */}
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rowActions.map((action) => (
                            <DropdownMenuItem
                              key={action.value}
                              onSelect={() => action.onClick(row)}
                            >
                              {action.icon && (
                                <span className="mr-2 h-4 w-4">
                                  {action.icon}
                                </span>
                              )}
                              {action.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
    </TableBody>
  );
}

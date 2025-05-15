import React from "react";
import { Table, TableHead, TableHeader, TableRow } from "./ui/table"; // Reverted path, assuming alias is correct
import type { ColumnConfig, CellValue /*, ColumnType*/ } from "../types/column"; // Import CellValue // Removed ColumnType

// --- dnd-kit imports ---
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  // useSortable, // Removed unused import
} from "@dnd-kit/sortable";
import { PinnedTable } from "./pinned-table/pinned-table";
// import { CSS } from "@dnd-kit/utilities"; // Removed unused import
import { Checkbox } from "./ui/checkbox"; // Import Checkbox
import { cn } from "../lib/utils"; // Need cn for merging classes
import { MoreHorizontal } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"; // Removed unused imports
import { DraggableTableHeader } from "./data-grid/draggable-table-header"; // <-- Import DraggableTableHeader
import type { DataGridClassNames, SortDirection } from "../types/data-grid"; // <-- Import types
import { DataGridBody } from "./data-grid/data-grid-body"; // <-- Import DataGridBody

// Import RowAction type
import type { RowAction } from "../types/column";

// Helper function for throttling with requestAnimationFrame
// Specify generic arguments for the function type T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttleWithRAF<Args extends any[], Result>(
  fn: (...args: Args) => Result
): (...args: Args) => void {
  let rafId: number | null = null;
  return (...args: Args) => {
    // Use Args here
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      fn(...args);
      rafId = null; // Allow next call
    });
  };
}

// Define the props for the DataGrid component
interface DataGridProps<
  T extends {
    id: string | number;
    [key: string]: CellValue;
  }
> {
  rows: T[];
  columns: ColumnConfig<T>[];
  onCellChange: (
    rowId: number | string,
    columnId: string,
    newValue: unknown
  ) => void;
  enableRowSelection?: boolean; // Prop to enable/disable row selection
  onSelectionChange?: (selectedIds: Set<string | number>) => void; // Callback for selection changes
  classNames?: DataGridClassNames; // Use imported type
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void; // Add prop definition
  onColumnDelete?: (columnId: string) => void; // <-- Add onColumnDelete prop
  isLoading?: boolean; // <-- Add isLoading prop
  skeletonComponent?: React.ReactNode; // <-- Add skeletonComponent prop
  rowActions?: RowAction<T>[]; // Prop for row actions menu items
  showColumnActionsMenu?: boolean; // Prop to show/hide column actions menu
}

// The main DataGrid component
export function DataGrid<
  T extends {
    id: string | number;
    [key: string]: CellValue;
  }
>({
  rows,
  columns: initialColumns,
  onCellChange,
  enableRowSelection = false, // Default to false
  onSelectionChange,
  classNames,
  onColumnChange,
  onColumnDelete, // <-- Destructure prop,
  isLoading,
  skeletonComponent,
  rowActions,
  showColumnActionsMenu,
}: DataGridProps<T>) {
  // --- Sorting State ---
  const [sortColumnId, setSortColumnId] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] =
    React.useState<SortDirection | null>(null);

  // --- Column Order State ---
  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    initialColumns.map((col) => col.id)
  );

  // Add a useEffect to sync columnOrder if initialColumns change externally
  // This is crucial if columns can be added/deleted from the parent
  React.useEffect(() => {
    const currentColumnIds = new Set(initialColumns.map((col) => col.id));
    // Filter out IDs that no longer exist in initialColumns
    // Add new IDs from initialColumns that weren't in columnOrder
    setColumnOrder((prevOrder) => {
      const newOrder = prevOrder.filter((id) => currentColumnIds.has(id));
      initialColumns.forEach((col) => {
        if (!newOrder.includes(col.id)) {
          // Simple approach: add new columns to the end.
          // More complex logic could try to insert them based on initial position.
          newOrder.push(col.id);
        }
      });
      // Prevent unnecessary state updates if the order hasn't actually changed
      if (JSON.stringify(newOrder) !== JSON.stringify(prevOrder)) {
        return newOrder;
      }
      return prevOrder;
    });
  }, [initialColumns]);

  // --- Active Dragged Header State ---
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // --- Row Selection State ---
  const [selectedRowIds, setSelectedRowIds] = React.useState<
    Set<string | number>
  >(new Set());

  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >(() =>
    initialColumns.reduce((acc, col) => {
      acc[col.id] = col.minWidth || 100;
      return acc;
    }, {} as Record<string, number>)
  );

  // --- Notify parent on selection change ---
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedRowIds);
    }
    // Intentionally only run when selectedRowIds changes, not onSelectionChange identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRowIds]);

  // Memoize columns based on order
  const columns = React.useMemo(() => {
    const columnMap = initialColumns.reduce((acc, col) => {
      acc[col.id] = col;
      return acc;
    }, {} as Record<string, ColumnConfig<T>>);
    return columnOrder.map((id) => columnMap[id]).filter(Boolean); // Filter out potentially missing IDs
  }, [initialColumns, columnOrder]);

  const handleSave = (
    rowId: string | number,
    columnId: string,
    newValue: unknown
  ) => {
    onCellChange(rowId, columnId, newValue);
  };

  const sortedRows = React.useMemo(() => {
    if (!sortColumnId || !sortDirection) {
      return rows;
    }

    const sortColumn = columns.find((col) => col.id === sortColumnId);
    if (!sortColumn) {
      return rows;
    }

    const sorted = [...rows].sort((a, b) => {
      const valueA = a[sortColumnId];
      const valueB = b[sortColumnId];

      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return sortDirection === "asc" ? -1 : 1;
      if (valueB == null) return sortDirection === "asc" ? 1 : -1;

      if (typeof valueA === "string" && typeof valueB === "string") {
        return (
          valueA.localeCompare(valueB) * (sortDirection === "asc" ? 1 : -1)
        );
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * (sortDirection === "asc" ? 1 : -1);
      }
      if (typeof valueA === "boolean" && typeof valueB === "boolean") {
        return (
          (Number(valueA) - Number(valueB)) * (sortDirection === "asc" ? 1 : -1)
        );
      }
      if (valueA instanceof Date && valueB instanceof Date) {
        return (
          (valueA.getTime() - valueB.getTime()) *
          (sortDirection === "asc" ? 1 : -1)
        );
      }

      // Add comparisons for other types (like arrays for multi-select) if needed
      // For multi-select, you might sort by array length or first element, etc.
      if (Array.isArray(valueA) && Array.isArray(valueB)) {
        // Example: sort by number of items
        // return (valueA.length - valueB.length) * (sortDirection === 'asc' ? 1 : -1);
        // Example: sort by first item alphabetically (if strings)
        const firstA = valueA[0];
        const firstB = valueB[0];
        if (typeof firstA === "string" && typeof firstB === "string") {
          return (
            firstA.localeCompare(firstB) * (sortDirection === "asc" ? 1 : -1)
          );
        }
        return 0; // Fallback for arrays if no specific logic
      }

      // Fallback if types are mixed or unhandled
      console.warn(`Unhandled sort comparison between:`, valueA, valueB);
      return 0;
    });

    return sorted;
  }, [rows, sortColumnId, sortDirection, columns]); // Add columns to dependency array

  const handleSort = (columnId: string) => {
    if (sortColumnId === columnId) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : current === "desc" ? null : "asc"
      );
      if (sortDirection === "desc") {
        setSortColumnId(null);
      }
    } else {
      setSortColumnId(columnId);
      setSortDirection("asc");
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null); // Reset active ID

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Get the currently dragged column for the overlay
  const activeColumn = React.useMemo(() => {
    return initialColumns.find((col) => col.id === activeId);
  }, [activeId, initialColumns]);

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const allIds = new Set(rows.map((row) => row.id));
      setSelectedRowIds(allIds);
    } else {
      setSelectedRowIds(new Set());
    }
  };

  const handleSelectRow = (
    rowId: string | number,
    checked: boolean | "indeterminate"
  ) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (checked === true) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  };

  const numRows = rows.length;
  const numSelected = selectedRowIds.size;
  const isAllSelected = numRows > 0 && numSelected === numRows;
  const isIndeterminate = numSelected > 0 && numSelected < numRows;
  const headerCheckboxState: boolean | "indeterminate" = isAllSelected
    ? true
    : isIndeterminate
    ? "indeterminate"
    : false;

  const tableRef = React.useRef<HTMLTableElement>(null);

  const [resizingColumn, setResizingColumn] = React.useState<{
    id: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  console.log("[ColumnWidths]", columnWidths);

  const handleResizeStart = React.useCallback(
    (columnId: string, startX: number) => {
      const initialCol = initialColumns.find((c) => c.id === columnId);
      const startWidth = columnWidths[columnId] || initialCol?.minWidth || 150; // Use state width first
      setResizingColumn({ id: columnId, startX, startWidth: startWidth });
    },
    [columnWidths, initialColumns] // Dependencies
  );

  const latestMouseEventRef = React.useRef<MouseEvent | null>(null);

  const [pinnedColumns, setPinnedColumns] = React.useState<
    Record<string, boolean>
  >({});

  const nonPinnedColumns = columns.filter((col) => !pinnedColumns[col.id]);
  const pinnedColumnsData = columns.filter((col) => pinnedColumns[col.id]);

  const totalPinnedWidth = React.useMemo(() => {
    return pinnedColumnsData.reduce((total, col) => {
      const width = columnWidths[col.id] || col.minWidth || 150;
      return total + width;
    }, 0);
  }, [pinnedColumnsData, columnWidths]);

  const performResize = React.useCallback(() => {
    if (!resizingColumn || !tableRef.current || !latestMouseEventRef.current) {
      return;
    }
    const event = latestMouseEventRef.current;
    const dx = event.clientX - resizingColumn.startX;
    let newWidth = resizingColumn.startWidth + dx;

    const columnConfig = initialColumns.find((c) => c.id === resizingColumn.id);
    const minWidth = columnConfig?.minWidth ?? 50; // Ensure a minimum width
    newWidth = Math.max(newWidth, minWidth);
    if (columnConfig?.maxWidth) {
      newWidth = Math.min(newWidth, columnConfig.maxWidth);
    }

    // Use setColumnWidths here - this was the missing link!
    setColumnWidths((prev) => ({ ...prev, [resizingColumn.id]: newWidth }));
  }, [resizingColumn, initialColumns, setColumnWidths]); // Add setColumnWidths dependency

  const throttledPerformResize = React.useMemo(
    () => throttleWithRAF(performResize),
    [performResize]
  );

  const handleRawMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!resizingColumn) return;
      latestMouseEventRef.current = event;
      throttledPerformResize();
    },
    [resizingColumn, throttledPerformResize]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!resizingColumn) return;
    latestMouseEventRef.current = null;
    setResizingColumn(null);
  }, [resizingColumn]);

  React.useEffect(() => {
    if (!resizingColumn) return;

    document.addEventListener("mousemove", handleRawMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleRawMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingColumn, handleRawMouseMove, handleMouseUp]);

  // --- Effect to change global cursor during resize ---
  React.useEffect(() => {
    if (resizingColumn) {
      // Set global cursor to indicate resizing
      document.body.style.cursor = "col-resize";

      // Return cleanup function to reset cursor when resizing stops or component unmounts
      return () => {
        document.body.style.cursor = "";
      };
    }
    // If resizingColumn is null, ensure cursor is reset (might be redundant but safe)
    document.body.style.cursor = "";
    // No cleanup needed if not resizing initially
    return undefined;
  }, [resizingColumn]); // Re-run this effect only when resizingColumn changes

  // Type assertion needed when passing handler down
  const typedOnColumnChange = onColumnChange as (
    updatedColumn: ColumnConfig<T>
  ) => void | undefined;

  // --- Column Deletion Handler ---
  const handleColumnDelete = (columnId: string) => {
    if (onColumnDelete) {
      // Call the parent handler
      onColumnDelete(columnId);
      // Optionally, immediately remove from local columnOrder state
      // This provides faster visual feedback, but the parent is the source of truth
      // setColumnOrder(prev => prev.filter(id => id !== columnId));
      // ^^ Commented out: Let parent update initialColumns which triggers useEffect
    }
  };
  // --- End Column Deletion Handler ---

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      modifiers={[restrictToHorizontalAxis]}
    >
      <div
        className={cn(
          "rounded-md relative border overflow-hidden", // Remove overflow-x-auto here
          classNames?.root
        )}
      >
        {pinnedColumnsData.length > 0 && (
          <PinnedTable
            enableRowSelection={enableRowSelection}
            headerCheckboxState={headerCheckboxState}
            handleSelectRow={handleSelectRow}
            handleSelectAll={handleSelectAll}
            pinnedColumns={pinnedColumnsData}
            rows={sortedRows} // Use sorted rows
            classNames={classNames}
            columnWidths={columnWidths}
            handleSave={handleSave}
            selectedRowIds={selectedRowIds}
            pinnedColumnsState={pinnedColumns}
            setPinnedColumns={setPinnedColumns}
            // Pass other needed props if PinnedTable cells become interactive
          />
        )}
        <div
          className="overflow-x-auto relative" // Add overflow-x-auto here
          style={{ paddingLeft: `${totalPinnedWidth}px` }} // Offset by pinned width
        >
          <Table
            ref={tableRef}
            suppressHydrationWarning
            style={{
              tableLayout: "fixed",
            }}
            className={cn("border-collapse", classNames?.table)}
          >
            <TableHeader className={cn(classNames?.header?.wrapper)}>
              <SortableContext
                items={nonPinnedColumns.map((col) => col.id)}
                strategy={horizontalListSortingStrategy}
              >
                <TableRow
                  className={cn(
                    "bg-muted hover:bg-muted/80",
                    classNames?.header?.row
                  )}
                >
                  {/* Selection Header */}
                  {enableRowSelection && pinnedColumnsData.length === 0 && (
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

                  {/* Draggable & Resizable Column Headers */}
                  {nonPinnedColumns.map((column) => {
                    const isSortable = !!column.isSortable;
                    const isCurrentSortColumn = sortColumnId === column.id;
                    const currentDirection = isCurrentSortColumn
                      ? sortDirection
                      : null;

                    // Use DraggableTableHeader component here
                    // We need to pass down props and the actual TH rendering logic
                    return (
                      <DraggableTableHeader
                        key={column.id}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        column={column as ColumnConfig<any>}
                        tableHeight={tableRef.current?.clientHeight}
                        pinnedColumns={pinnedColumns} // Pass state down
                        setPinnedColumns={setPinnedColumns} // Pass setter down
                        isSortable={isSortable}
                        currentDirection={currentDirection}
                        handleSort={handleSort}
                        onResizeStart={handleResizeStart}
                        isCurrentlyResizing={resizingColumn?.id === column.id}
                        width={columnWidths[column.id]}
                        classNames={classNames?.header}
                        onColumnChange={typedOnColumnChange}
                        onColumnDelete={handleColumnDelete}
                        showColumnActionsMenu={showColumnActionsMenu}
                      />
                    );
                  })}
                  {/* Actions Column Header (conditionally rendered) */}
                  {rowActions && rowActions.length > 0 && (
                    <TableHead
                      key="__actions_column__"
                      style={{ width: "50px", minWidth: "50px" }} // Fixed width, adjust as needed
                      className={cn(
                        "sticky right-0 z-10 bg-muted p-0", // Stick to right if needed, adjust bg
                        classNames?.header?.cell
                      )}
                    >
                      {/* Header content - could be an icon or empty */}
                      <div className="flex h-full items-center justify-center">
                        <MoreHorizontal className="h-4 w-4" />
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </SortableContext>
            </TableHeader>
            <DataGridBody
              rows={sortedRows}
              pinnedColumnsData={pinnedColumnsData} // Pass state down
              columns={nonPinnedColumns}
              selectedRowIds={selectedRowIds}
              handleSelectRow={handleSelectRow}
              handleSave={handleSave}
              columnWidths={columnWidths}
              enableRowSelection={enableRowSelection}
              classNames={classNames}
              isLoading={isLoading}
              rowActions={rowActions}
              skeletonComponent={skeletonComponent}
            />
          </Table>
        </div>
      </div>
      {/* Drag Overlay for visual feedback */}
      <DragOverlay>
        {activeId && activeColumn ? (
          // Render a representation of the header being dragged
          // Needs styling to look like a table header
          <div
            style={{
              opacity: 0.9,
              backgroundColor: "white",
              padding: "8px 12px",
              borderRadius: "4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minWidth: activeColumn.minWidth,
              maxWidth: activeColumn.maxWidth,
            }}
          >
            {activeColumn.header}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

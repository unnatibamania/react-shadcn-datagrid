import * as React from "react";
import { MoreVertical } from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { ColumnConfig } from "../../types/column"; // Assuming original path

interface ColumnActionsMenuProps<T> {
  column: ColumnConfig<T>;
  onColumnChange?: (updatedColumn: ColumnConfig<T>) => void;
  onColumnDelete?: (columnId: string) => void;
  setIsEditingColumn: (isEditing: boolean) => void;
  pinnedColumns: Record<string, boolean>;
  setPinnedColumns: (pinnedColumns: Record<string, boolean>) => void;
  stopPropagation: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function ColumnActionsMenu<T>({
  column,
  onColumnDelete,
  setIsEditingColumn,
  pinnedColumns,
  setPinnedColumns,
  stopPropagation,
}: ColumnActionsMenuProps<T>) {
  // Only render if there are actions available

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 cursor-pointer p-0"
          onMouseDown={stopPropagation} // Prevent drag/sort activation
          onTouchStart={stopPropagation}
          aria-label="Column actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {column.isEditable && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setIsEditingColumn(true)}
          >
            Edit
          </DropdownMenuItem>
        )}

        {column.isDeletable && (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => onColumnDelete?.(column.id)}
          >
            Delete
          </DropdownMenuItem>
        )}
        {/* Separator before Pin/Unpin if Edit or Delete are present */}

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() =>
            setPinnedColumns({
              ...pinnedColumns,
              [column.id]: !pinnedColumns[column.id],
            })
          }
        >
          {pinnedColumns?.[column.id] ? "Unpin" : "Pin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

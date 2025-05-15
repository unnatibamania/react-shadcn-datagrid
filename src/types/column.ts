export type ColumnType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "select"
  | "multi-select"
  | "user"
  | "rating"
  | "toggle"
  | "checkbox"
  | "custom";

// Define possible cell value types
export type CellValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | null
  | undefined;

type BaseColumnConfig<T> = {
  icon?: React.ReactNode;
  id: string;
  label: string;
  header: React.ReactNode;
  minWidth?: number;
  maxWidth?: number;
  isSortable?: boolean;
  isHidden?: boolean;
  isResizable?: boolean;
  isEditable?: boolean;
  isDeletable?: boolean;
  isDraggable?: boolean;
  cell: (row: T) => React.ReactNode;
};

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

// Type union for all possible column configurations
export type ColumnConfig<T> =
  | (BaseColumnConfig<T> & {
      type: "select";
      selectOptions: SelectOption[];
      multiSelectOptions?: never;
    })
  | (BaseColumnConfig<T> & {
      type: "multi-select";
      multiSelectOptions: SelectOption[];
      selectOptions?: never;
    })
  | (BaseColumnConfig<T> & {
      type: Exclude<ColumnType, "select" | "multi-select">;
      selectOptions?: never;
      multiSelectOptions?: never;
    });

// Define the type for row actions (added here)
export interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  value: string; // Unique value for key prop
  onClick: (row: T) => void;
}

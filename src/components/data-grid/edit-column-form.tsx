import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import type { ColumnConfig, ColumnType } from "../../types/column"; // Assuming original path for now

// --- Edit Column Form Component ---
export const EditColumnForm = <T,>({
  column,
  onSave,
}: {
  column: ColumnConfig<T>;
  onSave: (config: ColumnConfig<T>) => void;
}) => {
  // Store individual fields in state
  const [headerText, setHeaderText] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<ColumnType>(
    column.type
  );
  const [isEditable, setIsEditable] = React.useState(!!column.isEditable);
  const [isSortable, setIsSortable] = React.useState(!!column.isSortable);
  const [isResizable, setIsResizable] = React.useState(!!column.isResizable);
  const [isDraggable, setIsDraggable] = React.useState(!!column.isDraggable);
  const [isDeletable, setIsDeletable] = React.useState(!!column.isDeletable);
  const [isHidden, setIsHidden] = React.useState(!!column.isHidden);

  const availableTypes: Exclude<ColumnType, "user">[] = [
    "text",
    "number",
    "date",
    "boolean",
    "select",
    "multi-select",
    "rating",
    "toggle",
    "checkbox",
  ];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Construct config and assert its type
    const updatedConfig = {
      ...column,
      header: headerText,
      type: selectedType,
      isEditable,
      isSortable,
      isResizable,
      isDraggable,
      isDeletable,
      isHidden,
      selectOptions:
        selectedType === "select" ? column.selectOptions || [] : undefined,
      multiSelectOptions:
        selectedType === "multi-select"
          ? column.multiSelectOptions || []
          : undefined,
    } as ColumnConfig<T>; // Assert the final constructed object's type
    onSave(updatedConfig);
  };

  const renderToggle = (
    label: string,
    checked: boolean,
    onCheckedChange: (checked: boolean) => void
  ) => (
    <div className="flex items-center space-x-2 mb-2">
      <Switch
        id={`${column.id}-${label.toLowerCase().replace(" ", "-")}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={`${column.id}-${label.toLowerCase().replace(" ", "-")}`}>
        {label}
      </Label>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-4  w-full space-y-4">
      {/* Column Header (Name) Input */}
      <div className="space-y-2">
        <Label htmlFor={`${column.id}-header`}>Header Text</Label>
        <Input
          id={`${column.id}-header`}
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          placeholder="Column Name"
        />
      </div>

      {/* Column Type Select */}
      <div className="space-y-2 w-full">
        <Label htmlFor={`${column.id}-type`}>Column Type</Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as ColumnType)}
        >
          <SelectTrigger className="w-full" id={`${column.id}-type`}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Boolean Toggles */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
        {renderToggle("Cell Editable", isEditable, setIsEditable)}
        {renderToggle("Sortable", isSortable, setIsSortable)}
        {renderToggle("Resizable", isResizable, setIsResizable)}
        {renderToggle("Draggable", isDraggable, setIsDraggable)}
        {renderToggle("Deletable", isDeletable, setIsDeletable)}
        {renderToggle("Hidden", isHidden, setIsHidden)}
      </div>

      {/* TODO: Add inputs for minWidth, maxWidth, options based on type */}

      <Button type="submit" size="sm">
        Save Changes
      </Button>
    </form>
  );
};

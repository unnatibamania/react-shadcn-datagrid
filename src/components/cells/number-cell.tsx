"use client";

import * as React from "react";
import { Input } from "../ui/input";

interface NumberCellProps {
  initialValue: number | null | undefined;
  onSave: (newValue: number | null) => void;
}

export function NumberCell({ initialValue, onSave }: NumberCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  // Store value as string during editing for input compatibility, but save as number
  const [currentValue, setCurrentValue] = React.useState(
    String(initialValue ?? "")
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const saveChanges = () => {
    setIsEditing(false);
    const numericValue = currentValue === "" ? null : parseFloat(currentValue);
    // Only save if the value actually changed
    if (numericValue !== initialValue) {
      onSave(numericValue);
    }
  };

  const handleBlur = () => {
    saveChanges();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      saveChanges();
      inputRef.current?.blur(); // Optionally remove focus
    } else if (event.key === "Escape") {
      setCurrentValue(String(initialValue ?? "")); // Revert changes
      setIsEditing(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty string, numbers, and potentially a single decimal point
    const value = event.target.value;
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setCurrentValue(value);
    }
  };

  React.useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="number" // Use number type for native controls/validation (optional)
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-full border rounded w-full box-border" // Removed px-2 py-1
        // Add step, min, max props if needed from column config
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer align-center  flex items-center justify-start truncate" // Removed px-2 py-1, w-full
    >
      {/* Display formatted number or "-" if null/undefined */}
      {initialValue != null ? initialValue.toLocaleString() : "-"}
    </div>
  );
}

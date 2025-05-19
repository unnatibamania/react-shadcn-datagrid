"use client";

import * as React from "react";
import { Input } from "../ui/input";

interface TextCellProps {
  initialValue: string;
  onSave: (newValue: string) => void;
}

export function TextCell({ initialValue, onSave }: TextCellProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(initialValue);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      onSave(value);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      inputRef.current?.blur(); // Trigger blur to save
    } else if (event.key === "Escape") {
      setValue(initialValue); // Revert changes
      setIsEditing(false);
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
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValue(e.target.value)
        }
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="h-full border rounded w-full box-border"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="cursor-pointer flex items-center justify-start truncate"
    >
      {value === "" ? "-" : value}
    </div>
  );
}

"use client";

import * as React from "react";
import { Checkbox } from "../ui/checkbox";
import { cn } from "../../lib/utils";

// Define reusable type for component classNames prop
type ComponentClassNames = {
  checkbox?: string;
  // Add others as needed
};

interface BooleanCellProps {
  initialValue: boolean | null | undefined;
  onSave: (newValue: boolean) => void; // Checkbox returns boolean | 'indeterminate', but we save as boolean
  isEditable?: boolean; // Optional: Allow disabling the checkbox
  classNames?: ComponentClassNames; // Accept component classNames
}

export function BooleanCell({
  initialValue,
  onSave,
  isEditable = true,
  classNames, // Destructure
}: BooleanCellProps) {
  // Ensure we have a definite boolean state for the checkbox
  const isChecked = Boolean(initialValue);

  const handleCheckedChange = (checked: boolean | "indeterminate") => {
    // We only care about true/false states, treat indeterminate as false for saving
    const newValue = checked === true;
    if (isEditable && newValue !== isChecked) {
      onSave(newValue);
    }
  };

  return (
    // Align checkbox to the start (left)
    <div className="flex items-center  justify-center h-full w-full">
      <Checkbox
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={!isEditable}
        aria-label={isChecked ? "Checked" : "Unchecked"} // Accessibility
        className={cn(classNames?.checkbox)}
      />
    </div>
  );
}

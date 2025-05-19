"use client";

import * as React from "react";
import { Switch } from "../ui/switch";
import { cn } from "../../lib/utils";

// Define reusable type
type ComponentClassNames = {
  toggleSwitch?: string;
  // Add others as needed
};

interface ToggleCellProps {
  initialValue: boolean | null | undefined;
  onSave: (newValue: boolean) => void;
  isEditable?: boolean;
  classNames?: ComponentClassNames; // Accept classNames
}

export function ToggleCell({
  initialValue,
  onSave,
  isEditable = true,
  classNames, // Destructure
}: ToggleCellProps) {
  const isChecked = Boolean(initialValue);

  const handleCheckedChange = (checked: boolean) => {
    // Switch directly provides boolean
    if (isEditable && checked !== isChecked) {
      onSave(checked);
    }
  };

  return (
    // Center the switch within the cell
    <div className="flex items-center justify-start h-full w-full">
      <Switch
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={!isEditable}
        aria-label={isChecked ? "Enabled" : "Disabled"} // Accessibility
        className={cn(classNames?.toggleSwitch)}
      />
    </div>
  );
}

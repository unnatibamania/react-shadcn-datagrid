"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { X } from "lucide-react"; // Removed CalendarIcon

import { cn } from "../../lib/utils"; // Assuming ShadCN utils path
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// Define reusable type (or import if centralized)
type ComponentClassNames = {
  dateTrigger?: string;
  calendar?: string;
  // Add others as needed
};

interface DateCellProps {
  initialValue: Date | null | undefined;
  onSave: (newValue: Date | null) => void;
  isEditable?: boolean;
  classNames?: ComponentClassNames; // Accept classNames
}

export function DateCell({
  initialValue,
  onSave,
  isEditable = true,
  classNames, // Destructure
}: DateCellProps) {
  // Use state to manage the popover open/closed status
  const [isOpen, setIsOpen] = React.useState(false);
  // Use initialValue directly for the calendar's selected state
  const currentDate =
    initialValue instanceof Date && isValid(initialValue)
      ? initialValue
      : undefined;

  const handleSelect = (selectedDate: Date | undefined) => {
    setIsOpen(false); // Close popover on selection
    // Ensure we save null if date is undefined, or if it's invalid
    const dateToSave =
      selectedDate instanceof Date && isValid(selectedDate)
        ? selectedDate
        : null;
    // Only save if the value has actually changed
    if (dateToSave?.getTime() !== currentDate?.getTime()) {
      onSave(dateToSave);
    }
  };

  const handleClear = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent popover trigger when clicking clear button
    setIsOpen(false);
    if (currentDate !== null) {
      // Only save if it was not already null
      onSave(null);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={isEditable ? setIsOpen : undefined}>
      <PopoverTrigger asChild disabled={!isEditable}>
        <Button
          variant={"outline"}
          className={cn(
            "w-full flex items-center justify-start text-left shadow-none rounded-lg font-normal border-0 bg-transparent",
            !currentDate && "text-muted-foreground",
            classNames?.dateTrigger
          )}
        >
          <div className="flex items-center flex-grow overflow-hidden">
            <span className="truncate">
              {currentDate ? (
                format(currentDate, "yyyy-MM-dd")
              ) : (
                <span>Pick a date</span>
              )}
            </span>
          </div>

          {currentDate && isEditable && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0 ml-auto"
              onClick={handleClear}
              aria-label="Clear date"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleSelect}
          initialFocus
          className={cn(classNames?.calendar)}
        />
      </PopoverContent>
    </Popover>
  );
}

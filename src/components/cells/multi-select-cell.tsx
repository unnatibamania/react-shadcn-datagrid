"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { SelectOption } from "../../types/column";

// Define a list of color classes (Tailwind examples)
// Using bg, border, and text colors with opacity where possible
const badgeColorClasses = [
  "border  bg-sky-100/80 text-sky-700",
  "border  bg-amber-100/80 text-amber-700",
  "border  bg-violet-100/80 text-violet-700",
  "border  bg-emerald-100/80 text-emerald-700",
  "border  bg-rose-100/80 text-rose-700",
  "border  bg-blue-100/80 text-blue-700",
  "border  bg-yellow-100/80 text-yellow-700",
  "border  bg-indigo-100/80 text-indigo-700",
];

// Function to get a consistent color based on the badge value (simple hash)
const getColorClass = (value: string): string => {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % badgeColorClasses.length;
  return badgeColorClasses[index];
};

// Update reusable type
type ComponentClassNames = {
  badge?: string;
  multiSelectTrigger?: string;
  multiSelectContent?: string;
  multiSelectCommand?: string;
  multiSelectInput?: string;
  multiSelectItem?: string;
  // Add others as needed
};

interface MultiSelectCellProps {
  initialValues: string[] | null | undefined;
  options: SelectOption[];
  onSave: (newValues: string[] | null) => void;
  isEditable?: boolean;
  maxDisplay?: number; // Max badges to show before +x
  classNames?: ComponentClassNames; // Accept classNames
}

export function MultiSelectCell({
  initialValues,
  options,
  onSave,
  isEditable = true,
  maxDisplay = 2,
  classNames, // Destructure
}: MultiSelectCellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  // Ensure we work with an array, treat null/undefined as empty
  const selectedValues = React.useMemo(
    () => new Set(initialValues || []),
    [initialValues]
  );

  // Local state for managing selections within the popover before saving
  const [currentSelected, setCurrentSelected] = React.useState(
    new Set(selectedValues)
  );

  // Update local state if initialValues prop changes externally
  React.useEffect(() => {
    setCurrentSelected(new Set(initialValues || []));
  }, [initialValues]);

  const handlePopoverOpenChange = (open: boolean) => {
    if (!isEditable) return;
    setIsOpen(open);
    if (!open) {
      // When closing, check if changes were made and save
      const initialSet = new Set(initialValues || []);
      const hasChanged =
        currentSelected.size !== initialSet.size ||
        ![...currentSelected].every((value) => initialSet.has(value));

      if (hasChanged) {
        const newValuesArray = Array.from(currentSelected);
        onSave(newValuesArray.length > 0 ? newValuesArray : null);
      }
    } else {
      // Reset currentSelected to initial when opening
      setCurrentSelected(new Set(initialValues || []));
    }
  };

  const toggleOption = (option: string) => {
    setCurrentSelected((prev) => {
      const next = new Set(prev);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      return next;
    });
  };

  // const displayBadges = displayValues.slice(0, maxDisplay);
  // const overflowCount = displayValues.length - maxDisplay;

  const displayBadges = options.filter((option) =>
    selectedValues.has(option.value)
  );

  const overflowCount = displayBadges.length - maxDisplay;

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild disabled={!isEditable}>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full border-0 rounded-lg justify-start font-normal truncate data-[state=open]:bg-accent",
            classNames?.multiSelectTrigger
          )}
        >
          <div className="flex gap-1 flex-wrap items-center">
            {displayBadges.length > 0 ? (
              displayBadges.map((value) => (
                <Badge
                  key={value.value}
                  className={cn(
                    "whitespace-nowrap px-1.5 py-0.5 text-xs rounded-full font-medium ",
                    getColorClass(value.value),
                    classNames?.badge
                  )}
                >
                  {value.icon} {value.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">(empty)</span>
            )}
            {overflowCount > 0 && (
              <Badge
                variant="outline"
                className="whitespace-nowrap rounded-full px-1.5 py-0.5 text-xs font-medium"
              >
                +{overflowCount}
              </Badge>
            )}
          </div>
          {isEditable && (
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[200px] p-0", classNames?.multiSelectContent)}
        align="start"
      >
        <Command className={cn(classNames?.multiSelectCommand)}>
          <CommandInput
            placeholder="Search options..."
            className={cn(classNames?.multiSelectInput)}
          />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = currentSelected.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option.value)}
                    style={{ cursor: "pointer" }}
                    className={cn(classNames?.multiSelectItem)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.icon} {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {currentSelected.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setCurrentSelected(new Set())}
                    style={{ cursor: "pointer", color: "red" }}
                    className={cn(classNames?.multiSelectItem)}
                  >
                    Clear selection
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
  const [currentSelected, setCurrentSelected] = React.useState(
    new Set(initialValues || [])
  );

  React.useEffect(() => {
    setCurrentSelected(new Set(initialValues || []));
  }, [initialValues]);

  const handlePopoverOpenChange = (open: boolean) => {
    if (!isEditable) return;
    setIsOpen(open);
    if (open) {
      // When opening, reset currentSelected to the latest initialValues
      setCurrentSelected(new Set(initialValues || []));
    }
    // onSave is now handled by toggleOption and clear selection
  };

  const toggleOption = (optionValue: string) => {
    const next = new Set(currentSelected);
    if (next.has(optionValue)) {
      next.delete(optionValue);
    } else {
      next.add(optionValue);
    }
    setCurrentSelected(next);
    const newValuesArray = Array.from(next);
    onSave(newValuesArray.length > 0 ? newValuesArray : null);
  };

  const handleClearSelection = () => {
    const next = new Set<string>();
    setCurrentSelected(next);
    onSave(null);
  };

  // Derive displayBadges from the local currentSelected state for immediate UI updates
  const displayBadges = React.useMemo(() => {
    return options.filter((option) => currentSelected.has(option.value));
  }, [options, currentSelected]);

  const badgesToShow = displayBadges.slice(0, maxDisplay);
  const overflowCount =
    displayBadges.length > maxDisplay ? displayBadges.length - maxDisplay : 0;

  return (
    <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
      <PopoverTrigger asChild disabled={!isEditable}>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          className={cn(
            "w-full border-0 rounded-lg justify-start font-normal truncate data-[state=open]:bg-accent h-auto py-1.5 px-2", // adjusted padding
            classNames?.multiSelectTrigger
          )}
        >
          <div className="flex gap-1 flex-wrap items-center w-full">
            {badgesToShow.length > 0 ? (
              badgesToShow.map((option) => (
                <Badge
                  key={option.value}
                  className={cn(
                    "whitespace-nowrap px-1.5 py-0.5 text-xs rounded-full font-medium",
                    getColorClass(option.value),
                    classNames?.badge
                  )}
                >
                  {option.icon} {option.label}
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
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 flex-shrink-0" />
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
                    onSelect={handleClearSelection}
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

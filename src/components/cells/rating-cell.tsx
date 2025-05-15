"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils";

// Define reusable type for component classNames prop
type ComponentClassNames = {
  ratingStar?: string;
  // Add others as needed
};

interface RatingCellProps {
  initialValue: number | null | undefined;
  onSave: (newValue: number | null) => void;
  isEditable?: boolean;
  maxRating?: number;
  classNames?: ComponentClassNames; // Accept component classNames
}

export function RatingCell({
  initialValue,
  onSave,
  isEditable = true,
  maxRating = 5,
  classNames, // Destructure
}: RatingCellProps) {
  const currentRating = initialValue ?? 0;
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (ratingValue: number) => {
    if (!isEditable) return;
    // Clicking the same star again clears the rating
    const newValue = ratingValue === currentRating ? null : ratingValue;
    if (newValue !== initialValue) {
      onSave(newValue);
    }
  };

  const handleMouseEnter = (ratingValue: number) => {
    if (!isEditable) return;
    setHoverRating(ratingValue);
  };

  const handleMouseLeave = () => {
    if (!isEditable) return;
    setHoverRating(0);
  };

  return (
    <div className="flex items-center justify-center space-x-1 h-full">
      {[...Array(maxRating)].map((_, index) => {
        const ratingValue = index + 1;
        const isFilled = ratingValue <= (hoverRating || currentRating);

        return (
          <Star
            key={ratingValue}
            className={cn(
              "h-5 w-5",
              isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
              isEditable && "cursor-pointer",
              classNames?.ratingStar
            )}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            aria-label={`Rate ${ratingValue} out of ${maxRating}`}
          />
        );
      })}
    </div>
  );
}

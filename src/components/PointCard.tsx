"use client";

import type { FibonacciPoint } from "@/types";

interface PointCardProps {
  point: FibonacciPoint;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function PointCard({
  point,
  isSelected,
  onClick,
  disabled = false,
}: PointCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative aspect-[3/4] w-full rounded-2xl
        flex items-center justify-center
        text-3xl font-bold
        transition-all duration-200 ease-out
        min-h-[88px]
        ${
          isSelected
            ? "bg-[var(--foreground)] text-[var(--background)] shadow-lg scale-105"
            : "bg-[var(--background)] text-[var(--foreground)] border-2 border-[var(--foreground)] hover:shadow-md hover:scale-102"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {point}
    </button>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface LogoIconProps {
  className?: string;
}

/** Rub el Hizb — 8-pointed Islamic star with open book center */
export function LogoIcon({ className }: LogoIconProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-4 w-4", className)}
      aria-hidden="true"
    >
      {/* Two overlapping rounded squares = 8-pointed star */}
      <rect
        x="20" y="20" width="40" height="40" rx="2"
        transform="rotate(45 40 40)"
        stroke="currentColor" strokeWidth="2.5" fill="none"
      />
      <rect
        x="20" y="20" width="40" height="40" rx="2"
        stroke="currentColor" strokeWidth="2.5" fill="none"
      />
      {/* Open book in center */}
      <path
        d="M32 44 L40 39 L48 44"
        stroke="currentColor" strokeWidth="2.5" fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      <line
        x1="40" y1="39" x2="40" y2="48"
        stroke="currentColor" strokeWidth="2" opacity="0.5"
      />
      {/* Dot above book */}
      <circle cx="40" cy="34" r="1.5" fill="currentColor" />
    </svg>
  );
}

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type IconButtonVariant = "default" | "ghost" | "outline";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  label: string;
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: "bg-secondary text-foreground hover:bg-secondary/80 active:bg-secondary/70",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-hover active:bg-surface-active",
  outline: "border border-input text-foreground hover:bg-surface-hover active:bg-surface-active",
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "h-7 w-7 rounded-md [&>svg]:h-3.5 [&>svg]:w-3.5",
  md: "h-9 w-9 rounded-lg [&>svg]:h-4 [&>svg]:w-4",
  lg: "h-11 w-11 rounded-lg [&>svg]:h-5 [&>svg]:w-5",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = "ghost", size = "md", label, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center transition-smooth",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";

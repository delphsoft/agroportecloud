import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary-hover",
  outline: "border border-border bg-surface text-fg hover:bg-muted",
  ghost: "text-muted-fg hover:bg-muted hover:text-fg",
  mp: "bg-mp text-white hover:bg-mp-hover",
};
const sizes: Record<string, string> = {
  default: "h-10 px-3 text-sm",
  sm: "h-8 px-2.5 text-xs",
  icon: "size-10 p-0",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children?: ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:opacity-50",
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

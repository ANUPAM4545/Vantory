import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "dark" | "outline" | "subtle" | "success";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-neutral-100 text-neutral-900 border border-neutral-200",
    dark: "bg-neutral-950 text-white border border-neutral-900",
    outline: "bg-transparent text-neutral-800 border border-neutral-300",
    subtle: "bg-neutral-50 text-neutral-600 border border-neutral-200/80",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono tracking-tight transition-colors select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

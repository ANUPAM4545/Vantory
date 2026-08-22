import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-neutral-300 rounded-2xl",
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 mb-4 shadow-subtle">
        {icon || <FolderOpen className="w-6 h-6 text-neutral-400" />}
      </div>

      <h4 className="text-base font-bold text-neutral-950 tracking-tight mb-1">
        {title}
      </h4>

      {description && (
        <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}

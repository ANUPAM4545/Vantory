import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      description,
      error,
      id: customId,
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
          >
            {label}
            {required && <span className="text-neutral-900 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          rows={rows}
          disabled={disabled}
          className={cn(
            "w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400",
            "transition-all duration-150 outline-none resize-y min-h-[80px]",
            "focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10",
            "disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed",
            error
              ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
              : "border-neutral-300 hover:border-neutral-400",
            className
          )}
          {...props}
        />

        {description && !error && (
          <p className="text-xs text-neutral-500">{description}</p>
        )}

        {error && (
          <p className="text-xs font-medium text-neutral-900">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

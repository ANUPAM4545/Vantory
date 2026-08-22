import React, { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  description?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      description,
      error,
      id: customId,
      required,
      disabled,
      options,
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

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            className={cn(
              "w-full h-10 pl-3.5 pr-10 text-sm bg-white border rounded-lg text-neutral-900 appearance-none",
              "transition-all duration-150 outline-none cursor-pointer",
              "focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10",
              "disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed",
              error
                ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                : "border-neutral-300 hover:border-neutral-400",
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <ChevronDown className="absolute right-3 w-4 h-4 text-neutral-500 pointer-events-none" />
        </div>

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

Select.displayName = "Select";

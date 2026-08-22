import React, { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      description,
      error,
      leftIcon,
      rightIcon,
      id: customId,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = customId || generatedId;
    const errorId = `${id}-error`;
    const descId = `${id}-desc`;

    const labelClean = label?.trim() || "";
    const labelHasAsterisk = labelClean.endsWith("*");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-semibold uppercase tracking-wider text-neutral-700"
          >
            {labelClean}
            {required && !labelHasAsterisk && <span className="text-neutral-950 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : description ? descId : undefined
            }
            className={cn(
              "w-full h-10 px-3.5 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400",
              "transition-all duration-150 outline-none",
              "focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10",
              "disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed",
              error
                ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                : "border-neutral-300 hover:border-neutral-400",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 text-neutral-400 flex items-center z-10">
              {rightIcon}
            </div>
          )}
        </div>

        {description && !error && (
          <p id={descId} className="text-xs text-neutral-500">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-xs font-medium text-neutral-900">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

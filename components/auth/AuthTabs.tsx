"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type AuthTabMode = "login" | "signup";

export interface AuthTabsProps {
  mode: AuthTabMode;
  onChange: (mode: AuthTabMode) => void;
  className?: string;
}

export function AuthTabs({ mode, onChange, className }: AuthTabsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 p-1 bg-neutral-100 border border-neutral-200 rounded-xl select-none",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onChange("login")}
        className={cn(
          "py-2 text-xs font-bold rounded-lg transition-all duration-150 text-center",
          mode === "login"
            ? "bg-neutral-950 text-white shadow-sm"
            : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
        )}
      >
        Sign In
      </button>

      <button
        type="button"
        onClick={() => onChange("signup")}
        className={cn(
          "py-2 text-xs font-bold rounded-lg transition-all duration-150 text-center",
          mode === "signup"
            ? "bg-neutral-950 text-white shadow-sm"
            : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60"
        )}
      >
        Create Account
      </button>
    </div>
  );
}

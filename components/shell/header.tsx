"use client";

import React from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  onMobileMenuToggle?: () => void;
  className?: string;
}

export function Header({ onMobileMenuToggle, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "h-14 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-subtle font-sans",
        className
      )}
    >
      {/* Left: Mobile Toggle */}
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle Navigation Drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-neutral-400">
          SkillAssociate Platform
        </span>
      </div>
    </header>
  );
}

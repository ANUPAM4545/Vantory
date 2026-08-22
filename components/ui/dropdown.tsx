"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className={cn(
              "absolute z-50 mt-2 w-56 rounded-xl bg-white border border-neutral-200 shadow-xl py-1 text-neutral-900 focus:outline-none",
              align === "right" ? "right-0" : "left-0",
              className
            )}
          >
            {items.map((item, index) => (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors text-left rounded-lg select-none",
                  item.destructive
                    ? "text-neutral-950 hover:bg-neutral-100 font-semibold"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
                  item.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <span className="w-4 h-4 flex items-center justify-center shrink-0">
                  {item.icon || null}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

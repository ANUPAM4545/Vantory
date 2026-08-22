"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex border-b border-neutral-200 gap-6", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-all duration-150 relative outline-none",
              isActive
                ? "border-neutral-950 text-neutral-950 font-semibold"
                : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
            )}
          >
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 text-xs rounded-full font-mono",
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "bg-neutral-100 text-neutral-600"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

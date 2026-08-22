"use client";

import React from "react";
import { User, Building2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export type UserEcosystemRole = "candidate" | "company" | "institute";

export interface RoleSelectorProps {
  selectedRole: UserEcosystemRole;
  onChange: (role: UserEcosystemRole) => void;
  className?: string;
}

export function RoleSelector({
  selectedRole,
  onChange,
  className,
}: RoleSelectorProps) {
  const roles: Array<{
    id: UserEcosystemRole;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: "candidate", label: "Candidate", icon: User },
    { id: "company", label: "Company", icon: Building2 },
    { id: "institute", label: "Institute", icon: GraduationCap },
  ];

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500">
        ACCOUNT TYPE
      </label>
      <div className="grid grid-cols-3 gap-2">
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 outline-none",
                isSelected
                  ? "bg-white border-neutral-950 text-neutral-950 shadow-subtle ring-1 ring-neutral-950"
                  : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:text-neutral-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isSelected ? "text-neutral-950" : "text-neutral-400")} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

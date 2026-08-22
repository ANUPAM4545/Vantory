import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

export function AuthFooter() {
  return (
    <div className="pt-4 border-t border-neutral-100 flex items-center justify-center gap-4 text-[11px] text-neutral-400 font-mono select-none">
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
        <span>256-bit SSL Encrypted</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-neutral-600" />
        <span>Strict Privacy Protected</span>
      </div>
    </div>
  );
}

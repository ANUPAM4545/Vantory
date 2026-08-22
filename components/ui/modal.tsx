"use client";

import React, { useEffect, useId } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  // Use body scroll lock hook exclusively for overflow & padding-right compensation
  useBodyScrollLock(isOpen);

  // Modal / Dialog layer handles Escape key dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 selection:bg-neutral-900 selection:text-white custom-scrollbar"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Centering Wrapper */}
          <div className="min-h-full flex items-start justify-center py-6 sm:py-12">
            {/* Modal Card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? titleId : undefined}
              aria-describedby={description ? descriptionId : undefined}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(
                "relative w-full max-w-lg bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-neutral-950 space-y-4",
                className
              )}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              {title && (
                <h2
                  id={titleId}
                  className="text-xl font-extrabold tracking-tight text-neutral-950 pr-8"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p id={descriptionId} className="text-xs text-neutral-500 font-medium">
                  {description}
                </p>
              )}

              <div>{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

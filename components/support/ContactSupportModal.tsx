"use client";

import React, { useEffect, useId } from "react";
import { X, PhoneCall } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SupportContactInfo } from "./SupportContactInfo";
import { ContactSupportForm } from "./ContactSupportForm";
import { useBodyScrollLock } from "@/lib/hooks/useBodyScrollLock";
import { cn } from "@/lib/utils";

export interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const titleId = useId();

  // Use body scroll lock hook
  useBodyScrollLock(isOpen);

  // Dialog layer Escape key listener
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
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs overflow-y-auto p-4 sm:p-6 selection:bg-neutral-900 selection:text-white custom-scrollbar"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          {/* Centering Wrapper */}
          <div className="min-h-full flex items-start justify-center py-6 sm:py-12">
            {/* Centered Support Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className={cn(
                "relative w-full max-w-md bg-white border border-neutral-200 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 z-10 text-neutral-950 space-y-6"
              )}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-colors cursor-pointer"
                aria-label="Close support modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center text-center">
                <div className="w-11 h-11 rounded-2xl bg-neutral-950 text-white flex items-center justify-center mb-3 shadow-md">
                  <PhoneCall className="w-5 h-5 text-white" />
                </div>
                <h3 id={titleId} className="text-xl font-black tracking-tight text-neutral-950">
                  Direct Support & Contact
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  SkillAssociate Platform — Get in touch with our team.
                </p>
              </div>

              {/* Support Info Box */}
              <SupportContactInfo />

              {/* Contact Form */}
              <ContactSupportForm onSuccessClose={onClose} />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

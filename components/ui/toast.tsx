"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "info" | "success" | "error";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; description?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    ({ type = "info", title, description }: { type?: ToastType; title: string; description?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, description }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto bg-neutral-950 text-white border border-neutral-800 rounded-xl p-4 shadow-2xl flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-white">
                  {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-white" />}
                  {t.type === "error" && <AlertCircle className="w-4 h-4 text-white" />}
                  {t.type === "info" && <Info className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold tracking-tight text-white">{t.title}</h5>
                  {t.description && (
                    <p className="text-xs text-neutral-400 mt-0.5">{t.description}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.12,
        ease: "easeOut",
      }}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}

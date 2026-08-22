"use client";

import { useEffect } from "react";

/**
 * Custom hook to lock body scrolling when a modal/overlay is active.
 * Handles scrollbar padding compensation to prevent background layout jumps
 * and restores original body overflow/padding-right on unmount or close.
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    // Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent horizontal layout shift
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    // Apply lock & compensation
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);
}

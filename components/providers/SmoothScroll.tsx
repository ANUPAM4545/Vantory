"use client";

import React, { useEffect } from "react";
import type Lenis from "lenis";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenisInstance: Lenis | null = null;
    let animationFrameId: number;

    import("lenis").then((LenisModule) => {
      const LenisClass = LenisModule.default;
      lenisInstance = new LenisClass({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.8,
        infinite: false,
        prevent: (node: HTMLElement) => {
          return (
            node.dataset?.lenisPrevent === "true" ||
            node.classList?.contains("custom-scrollbar") ||
            node.closest?.("[data-lenis-prevent]") !== null
          );
        },
      });

      function raf(time: number) {
        if (lenisInstance) {
          // Pause Lenis RAF loop if body scroll is locked by a modal
          if (document.body.style.overflow === "hidden") {
            lenisInstance.stop();
          } else {
            lenisInstance.start();
            lenisInstance.raf(time);
          }
        }
        animationFrameId = requestAnimationFrame(raf);
      }

      animationFrameId = requestAnimationFrame(raf);
    });

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenisInstance) lenisInstance.destroy();
    };
  }, []);

  return <>{children}</>;
}

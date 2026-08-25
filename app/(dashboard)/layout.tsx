"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/shell/sidebar";
import { Header } from "@/components/shell/header";
import { MobileNav } from "@/components/shell/mobile-nav";
import { ToastProvider } from "@/components/ui/toast";
import { CompanyOnboardingModal } from "@/components/company/CompanyOnboardingModal";
import { InstituteOnboardingModal } from "@/components/institute/InstituteOnboardingModal";
import { PageTransition } from "@/components/providers/PageTransition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 flex flex-col md:flex-row antialiased selection:bg-neutral-900 selection:text-white">
        {/* Onboarding Modals */}
        <CompanyOnboardingModal />
        <InstituteOnboardingModal />

        {/* Desktop Sidebar */}
        <Sidebar className="hidden md:flex" />

        {/* Mobile Navigation Drawer */}
        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />

        {/* Main Application Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <Header onMobileMenuToggle={() => setIsMobileNavOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <PageTransition>{children}</PageTransition>
          </main>

          {/* Minimal SaaS Footer */}
          <footer className="border-t border-neutral-200 py-4 px-6 text-center text-xs font-mono text-neutral-400">
            Vantory Platform • Strict Monochrome Standard • Version 1.0.0
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
}

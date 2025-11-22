// src/components/layout/dashboard-wrapper.tsx
"use client"; // Client Component ekanligini bildiramiz

import React from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useSidebarStore } from "@/store/sidebar-store"; // Zustand store import qilamiz
import { cn } from "@/lib/utils"; // cn utilitini import qilamiz

// Asosiy Layout Wrapper
export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebarStore(); // Sidebar holatini olamiz

  return (
    <div className="flex min-h-screen">
      {/* 1. Sidebar (Fixed) */}
      <Sidebar />

      {/* 2. Asosiy Content qismi */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isOpen ? "ml-64" : "ml-20" // Sidebar kengligiga mos ravishda margin
        )}
      >
        {/* Header (Sticky) */}
        <Header />

        {/* Page Content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}

// src/components/layout/sidebar.tsx
"use client";

import {
  Map,
  BarChart2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Faol linkni aniqlash uchun
import { ThemeToggle } from "../shared/theme-toggle";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store"; // Zustand store import qilamiz
import { Button } from "@/components/ui/button"; // Button komponentini alias orqali import qilamiz

// Sidebar navigatsiya elementlari
const navItems = [
  { href: "/", icon: Map, label: "Live Xarita" },
  { href: "/analytics", icon: BarChart2, label: "Analitika" },
  { href: "/admin", icon: Users, label: "Admin Panel" },
];

export function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebarStore();
  const pathname = usePathname(); // Faol yo'lni aniqlash

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full border-r bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out z-20 shadow-xl flex flex-col",
        isOpen ? "w-64" : "w-20" // Kengaytirilgan holatda 200px, yopiq holatda 80px
      )}
    >
      {/* Yuqori qism: Logo va Toggle tugmasi */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
        {isOpen && (
          <h1 className="text-2xl font-black text-primary dark:text-white transition-opacity duration-300">
            UZ-NEXUS
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            "rounded-full transition-all duration-300",
            isOpen ? "ml-auto" : "mx-auto" // Toggle tugmasini markazga joylash
          )}
          aria-label={isOpen ? "Sidebar'ni yopish" : "Sidebar'ni ochish"}
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* O'rta qism: Navigatsiya */}
      <nav className="flex flex-col space-y-2 flex-grow p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 group relative",
              "text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-gray-400 dark:hover:text-primary",
              pathname === item.href &&
                "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-medium"
            )}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
            {isOpen && (
              <span className="whitespace-nowrap transition-opacity duration-300 delay-100">
                {item.label}
              </span>
            )}
            {!isOpen && ( // Yopiq holatda tooltip effekt
              <span className="absolute left-full rounded-md px-2 py-1 ml-4 bg-gray-700 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Pastki qism: Sozlamalar va Theme Toggle */}
      <div className="flex flex-col space-y-2 p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 group relative",
            "text-gray-600 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          )}
          title="Sozlamalar"
        >
          <Settings className="h-5 w-5" />
          {isOpen && (
            <span className="whitespace-nowrap transition-opacity duration-300 delay-100">
              Sozlamalar
            </span>
          )}
          {!isOpen && (
            <span className="absolute left-full rounded-md px-2 py-1 ml-4 bg-gray-700 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
              Sozlamalar
            </span>
          )}
        </Link>
        <div
          className={cn(
            "flex items-center",
            isOpen ? "justify-between" : "justify-center"
          )}
        >
          {isOpen && (
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              Mavzu
            </span>
          )}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

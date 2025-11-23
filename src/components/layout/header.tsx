// src/components/layout/header.tsx
"use client"; // Client Component ekanligini bildiramiz

import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar-store"; // Zustand store import qilamiz
import { useState } from "react"; // Qidiruv maydoni holatini boshqarish uchun

export function Header() {
  const { toggleMobileSidebar } = useSidebarStore(); // Mobil sidebar'ni ochib/yopish funksiyasi
  const [isSearchFocused, setIsSearchFocused] = useState(false); // Qidiruv maydoni focus holati

  return (
    <header className="sticky top-0 z-10 h-16 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 flex items-center justify-between px-6 shadow-md transition-colors duration-300">
      {/* Chap qism: Mobil Menu tugmasi va Qidiruv */}
      <div className="flex items-center space-x-4">
        {/* Mobil Menu tugmasi (faqat kichik ekranlarda ko'rinadi) */}
        <button
          className="sm:hidden text-gray-600 dark:text-gray-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          onClick={toggleMobileSidebar} // Mobil sidebarni ochish
          aria-label="Mobil menyuni ochish"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Qidiruv maydoni (desktop va katta ekranlarda) */}
        <div
          className={cn(
            "relative w-72 max-w-md hidden sm:block transition-all duration-300",
            isSearchFocused ? "w-80" : "w-72" // Focus bo'lganda kengaytirish
          )}
        >
          <Search
            className={cn(
              "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-colors duration-300",
              isSearchFocused && "text-primary dark:text-primary-foreground" // Focus bo'lganda rangini o'zgartirish
            )}
          />
          <Input
            placeholder="Dashboard bo'ylab qidiruv..."
            className="pl-9 bg-gray-50 dark:bg-gray-800 border-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-foreground transition-all duration-300"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>
      </div>

      {/* O'ng qism: Bildirishnomalar va Profil */}
      <div className="flex items-center space-x-4">
        {/* Bildirishnomalar tugmasi */}
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors group relative"
          aria-label="Bildirishnomalar"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse">
            {/* Bildirishnomalar sonini ko'rsatish mumkin */}
          </span>
          {/* Tooltip */}
          <span className="absolute -bottom-7 right-1/2 translate-x-1/2 rounded-md px-2 py-1 bg-gray-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            Bildirishnomalar
          </span>
        </button>

        {/* Profil avatari */}
        <div
          className="relative h-8 w-8 rounded-full bg-primary dark:bg-primary-foreground flex items-center justify-center text-white dark:text-gray-900 font-medium text-sm cursor-pointer hover:ring-2 hover:ring-primary dark:hover:ring-primary-foreground transition-all duration-200 group"
          aria-label="Profil"
        >
          A{/* Tooltip */}
          <span className="absolute -bottom-7 right-1/2 translate-x-1/2 rounded-md px-2 py-1 bg-gray-700 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
            Profil
          </span>
        </div>
      </div>
    </header>
  );
}

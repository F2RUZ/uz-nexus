// src/components/layout/dashboard-wrapper.tsx
import React from "react";
// ✅ ThemeToggle komponentini import qilish
import { ThemeToggle } from "@/components/shared/theme-toggle"; // Bu qatorni qo'shing!

// Kichik fiksirlangan Sidebar (80px) va asosiy content maydoni uchun layout
export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* 8. Sidebar o'rni (Keyingi qadamda yaratiladi) */}
      <aside className="w-20 fixed top-0 left-0 h-full border-r bg-white dark:bg-gray-800 dark:border-gray-700 shadow-md">
        {/* Hozircha bo'sh, keyingi qadamda Sidebarni qo'yamiz */}
        <div className="flex flex-col items-center justify-between h-full py-4">
          <h1 className="text-xl font-bold text-primary dark:text-white">UZ</h1>
          {/* Dark/Light mode tugmachasi pastda joylashadi */}
          <ThemeToggle /> {/* Endi bu yerda xato bo'lmasligi kerak */}
        </div>
      </aside>

      {/* 9. Asosiy Content va Header */}
      <main className="flex-1 ml-20">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 w-full border-b bg-white dark:bg-gray-800 dark:border-gray-700 flex items-center px-6 shadow-sm">
          <h2 className="text-lg font-semibold">Dashboard Overview</h2>
          {/* Kelajakda bu yerga Profil va Bildirishnomalar qo'yiladi */}
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

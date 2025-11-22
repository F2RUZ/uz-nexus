// src/store/sidebar-store.ts
import { create } from "zustand";

interface SidebarState {
  isOpen: boolean; // Desktop versiya uchun
  isMobileOpen: boolean; // Mobil versiya uchun
  toggleSidebar: () => void; // Desktop sidebar'ni ochib/yopish
  toggleMobileSidebar: () => void; // Mobil sidebar'ni ochib/yopish
  closeMobileSidebar: () => void; // Mobil sidebar'ni yopish
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: true, // Desktop: Boshlanishida ochiq
  isMobileOpen: false, // Mobil: Boshlanishida yopiq
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  closeMobileSidebar: () => set(() => ({ isMobileOpen: false })),
}));

// src/components/layout/theme-provider.tsx
"use client";

import * as React from "react";
// ✅ To'g'ri import yo'li: ThemeProviderProps to'g'ridan-to'g'ri "next-themes" dan import qilinadi
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

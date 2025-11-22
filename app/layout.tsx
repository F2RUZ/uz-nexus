// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Layout komponentlarini import qilamiz
import { ThemeProvider } from "@/components/layout/theme-provider";
import { DashboardWrapper } from "@/components/layout/dashboard-wrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UZ-NEXUS | Live Monitoring Dashboard",
  description: "Professional Next.js Dashboard loyihasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ThemeProvider ni qo'shamiz. 'system' default rejim bo'ladi. */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Asosiy Layout Wrapperimiz ichida Contentni ko'rsatamiz */}
          <DashboardWrapper>{children}</DashboardWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

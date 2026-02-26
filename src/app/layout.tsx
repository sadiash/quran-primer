import type { Metadata } from "next";
import { Inter, Amiri, Scheherazade_New, Cormorant_Garamond } from "next/font/google";
import {
  ThemeProvider,
  QueryProvider,
  AudioProvider,
} from "@/presentation/providers";
import { ToastProvider, ThemeNameSync } from "@/presentation/components/ui";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-arabic-display",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const scheherazadeNew = Scheherazade_New({
  variable: "--font-arabic-reading",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "The Primer",
  description:
    "VS Code for the Quran — a personal knowledge system disguised as a reading app.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Primer",
  },
};

export const viewport: Viewport = {
  themeColor: "#C9A227",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${amiri.variable} ${scheherazadeNew.variable} ${cormorantGaramond.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-soft-sm"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <QueryProvider>
            <AudioProvider>
              <ThemeNameSync />
              <ToastProvider>{children}</ToastProvider>
            </AudioProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

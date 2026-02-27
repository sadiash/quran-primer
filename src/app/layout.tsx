import type { Metadata, Viewport } from "next";
import { Amiri, Scheherazade_New, Space_Grotesk, Space_Mono } from "next/font/google";
import { QueryProvider, AudioProvider } from "@/presentation/providers";
import { ToastProvider } from "@/presentation/components/ui";
import "./globals.css";

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

const spaceGrotesk = Space_Grotesk({
  variable: "--font-brutalist-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-brutalist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "The Primer",
  description:
    "Immersive reading, layered commentary, and personal knowledge building for the Quran.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Primer",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${amiri.variable} ${scheherazadeNew.variable} ${spaceGrotesk.variable} ${spaceMono.variable} antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <QueryProvider>
          <AudioProvider>
            <ToastProvider>{children}</ToastProvider>
          </AudioProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

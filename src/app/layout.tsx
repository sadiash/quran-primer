import type { Metadata } from "next";
import { Inter, Amiri, Scheherazade_New } from "next/font/google";
import { ThemeProvider, QueryProvider } from "@/presentation/providers";
import { ToastProvider } from "@/presentation/components/ui";
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

export const metadata: Metadata = {
  title: "The Primer",
  description:
    "VS Code for the Quran — a personal knowledge system disguised as a reading app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${amiri.variable} ${scheherazadeNew.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

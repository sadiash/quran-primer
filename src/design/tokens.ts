/**
 * Design Tokens — The Primer
 *
 * Two independent aesthetics connected by gold/amber:
 * - "The Library" (light): warm ivory, espresso ink, scholarly gold, paper depth
 * - "The Observatory" (dark): cosmic navy, silver text, bright amber, glass panels
 *
 * All colors are HSL triplets (e.g. "36 72% 44%") for use with CSS `hsl()`.
 * The CSS layer in globals.css consumes these via @theme / custom properties.
 */

// ─── Color Tokens ────────────────────────────────────────────

export const colors = {
  light: {
    background: "40 33% 96%",
    foreground: "30 18% 14%",

    card: "38 30% 97%",
    cardForeground: "30 18% 14%",

    popover: "38 30% 97%",
    popoverForeground: "30 18% 14%",

    primary: "36 72% 44%",
    primaryForeground: "40 33% 97%",

    secondary: "38 18% 91%",
    secondaryForeground: "30 18% 20%",

    muted: "35 14% 90%",
    mutedForeground: "30 8% 46%",

    accent: "168 28% 38%",
    accentForeground: "40 33% 97%",

    destructive: "0 65% 51%",
    destructiveForeground: "40 33% 97%",

    border: "35 18% 86%",
    input: "35 18% 86%",
    ring: "36 72% 44%",

    // Extended surfaces
    surface: "40 28% 98%",
    surfaceHover: "38 22% 94%",
    surfaceActive: "36 20% 91%",

    // Glow
    glowPrimary: "36 80% 50%",
    glowAccent: "168 40% 45%",
    glowStrength: "0.08",

    // Glass
    glassBg: "38 30% 97% / 0.7",
    glassBorder: "35 18% 86% / 0.5",
    glassBlur: "16px",

    // Sidebar
    sidebarBackground: "38 25% 94%",
    sidebarForeground: "30 14% 24%",
    sidebarPrimary: "36 72% 44%",
    sidebarPrimaryForeground: "40 33% 97%",
    sidebarAccent: "38 18% 91%",
    sidebarAccentForeground: "30 14% 24%",
    sidebarBorder: "35 18% 86%",
    sidebarRing: "36 72% 44%",
  },

  dark: {
    background: "225 35% 7%",
    foreground: "220 15% 85%",

    card: "225 30% 10%",
    cardForeground: "220 15% 85%",

    popover: "225 30% 10%",
    popoverForeground: "220 15% 85%",

    primary: "42 88% 56%",
    primaryForeground: "225 35% 7%",

    secondary: "225 22% 14%",
    secondaryForeground: "220 15% 80%",

    muted: "225 18% 16%",
    mutedForeground: "220 10% 55%",

    accent: "185 55% 48%",
    accentForeground: "225 35% 7%",

    destructive: "0 60% 45%",
    destructiveForeground: "220 15% 90%",

    border: "225 18% 18%",
    input: "225 18% 18%",
    ring: "42 88% 56%",

    // Extended surfaces
    surface: "225 28% 9%",
    surfaceHover: "225 24% 13%",
    surfaceActive: "225 22% 16%",

    // Glow
    glowPrimary: "42 90% 58%",
    glowAccent: "185 60% 52%",
    glowStrength: "0.15",

    // Glass
    glassBg: "225 30% 12% / 0.6",
    glassBorder: "225 20% 22% / 0.4",
    glassBlur: "20px",

    // Sidebar
    sidebarBackground: "225 32% 9%",
    sidebarForeground: "220 12% 75%",
    sidebarPrimary: "42 88% 56%",
    sidebarPrimaryForeground: "225 35% 7%",
    sidebarAccent: "225 22% 14%",
    sidebarAccentForeground: "220 12% 75%",
    sidebarBorder: "225 18% 18%",
    sidebarRing: "42 88% 56%",
  },
} as const;

// ─── Typography Tokens ───────────────────────────────────────

export const typography = {
  fonts: {
    /** Arabic display — ornamental headers, bismillah */
    arabicDisplay: "'Amiri Quran', 'Amiri', serif",
    /** Arabic reading — body text, verses */
    arabicReading: "'Scheherazade New', 'Amiri', serif",
    /** UI text — labels, buttons, navigation */
    ui: "'Inter', system-ui, sans-serif",
    /** Display headings — surah titles, section headers */
    display: "'Inter', system-ui, sans-serif",
  },

  /** Font sizes follow a modular scale (minor third ~1.2) */
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  /** Line heights tuned for Arabic readability */
  lineHeights: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2.0",
    /** Arabic text needs generous line height for diacritics */
    arabic: "2.4",
    /** Arabic with full tashkeel */
    arabicLoose: "2.8",
  },

  weights: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

// ─── Spacing Tokens ──────────────────────────────────────────

/** 4px grid system */
export const spacing = {
  px: "1px",
  0: "0",
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem", // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
} as const;

// ─── Animation Tokens ────────────────────────────────────────

export const animation = {
  durations: {
    micro: "150ms",
    standard: "250ms",
    emphasis: "400ms",
    slow: "600ms",
  },

  easings: {
    /** Snappy deceleration — most interactions */
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    /** Smooth acceleration — exit animations */
    in: "cubic-bezier(0.7, 0, 0.84, 0)",
    /** Symmetrical — looping/attention */
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    /** Springy overshoot — playful emphasis */
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
} as const;

// ─── Border Radius ───────────────────────────────────────────

export const radii = {
  sm: "calc(0.625rem - 4px)", // ~6px
  md: "calc(0.625rem - 2px)", // ~8px
  lg: "0.625rem", // 10px
  xl: "0.875rem", // 14px
  "2xl": "1.25rem", // 20px
  full: "9999px",
} as const;

// ─── Shadows ─────────────────────────────────────────────────

export const shadows = {
  light: {
    sm: "0 1px 3px hsl(30 18% 14% / 0.04)",
    md: "0 4px 12px hsl(30 18% 14% / 0.06)",
    lg: "0 10px 30px hsl(30 18% 14% / 0.08)",
    glow: "0 0 20px hsl(36 80% 50% / 0.1)",
    card: "0 2px 8px hsl(30 18% 14% / 0.04), 0 0 1px hsl(30 18% 14% / 0.06)",
  },

  dark: {
    sm: "0 1px 3px hsl(225 40% 3% / 0.3)",
    md: "0 4px 12px hsl(225 40% 3% / 0.4)",
    lg: "0 10px 30px hsl(225 40% 3% / 0.5)",
    glow: "0 0 30px hsl(42 90% 58% / 0.12)",
    card: "0 2px 8px hsl(225 40% 3% / 0.3), 0 0 1px hsl(225 20% 22% / 0.5)",
  },
} as const;

// ─── Breakpoints ─────────────────────────────────────────────

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1440px",
} as const;

// ─── Z-Index Scale ───────────────────────────────────────────

export const zIndex = {
  base: "0",
  raised: "10",
  dropdown: "20",
  sticky: "30",
  overlay: "40",
  modal: "50",
  toast: "60",
  tooltip: "70",
  commandPalette: "80",
} as const;

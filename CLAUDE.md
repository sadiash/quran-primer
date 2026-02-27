# The Primer — Development Guide

## Overview

Quran study app with brutalist/editorial design. Next.js 16, Tailwind v4, local-first data.

---

## CRITICAL: Arabic Font System — DO NOT BREAK

The Arabic font is the single most fragile part of the UI. It has been accidentally broken multiple times. Follow this chain exactly.

### Font Loading Pipeline

```
layout.tsx (next/font/google)
  → CSS variables on <body>
    → globals.css @theme block (Tailwind integration)
      → .arabic-display / .arabic-reading classes
        → Components use these classes
```

### Step 1: layout.tsx — Font Imports

```typescript
// src/app/layout.tsx
import { Amiri, Scheherazade_New } from "next/font/google";

const amiri = Amiri({
  variable: "--font-arabic-display",   // ← THIS EXACT NAME
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const scheherazadeNew = Scheherazade_New({
  variable: "--font-arabic-reading",   // ← THIS EXACT NAME
  subsets: ["arabic"],
  weight: ["400", "700"],
});

// BOTH must be on <body>:
<body className={`${amiri.variable} ${scheherazadeNew.variable} ...`}>
```

### Step 2: globals.css — Theme Integration

```css
/* In @theme block — makes fonts available to Tailwind */
--font-arabic-display: "Amiri Quran", "Amiri", serif;
--font-arabic-reading: "Scheherazade New", "Amiri", serif;
```

### Step 3: globals.css — CSS Classes

```css
/* Display font — large Arabic text, watermarks, headers */
.arabic-display {
  font-family: var(--font-arabic-display);
  line-height: 2.4;
  letter-spacing: 0.01em;
}

/* Reading font — verse text, body Arabic */
.arabic-reading {
  font-family: var(--font-arabic-reading);
  line-height: 2.6;
  text-rendering: optimizeLegibility;
  letter-spacing: 0.015em;
  word-spacing: 0.06em;
  font-feature-settings: "liga" 1, "calt" 1, "kern" 1;
}

/* Global fallback for any Arabic content */
[lang="ar"], [dir="rtl"] {
  font-family: var(--font-arabic-reading);
  line-height: 2.6;
  direction: rtl;
  text-align: right;
}
```

### Where Arabic Fonts Are Used

| Component | Class | Purpose |
|-----------|-------|---------|
| `verse-block.tsx` | `.arabic-reading` | Main verse text |
| `mushaf-surface.tsx` | `.arabic-reading` | Mushaf page view |
| `study-view.tsx` | `.arabic-reading` | Study panel verse |
| `theater-verse.tsx` | via `lang="ar"` | Theater mode |
| `surah-header.tsx` | `.arabic-display` | Surah name in reading header |
| `reading-surface.tsx` | `.arabic-display` | Bismillah text |
| `surah-browser-brutalist.tsx` | `.arabic-display` | Card watermarks + verse jump |
| `hadith-browser.tsx` | `.arabic-display` | Collection watermarks |
| `bookmarks/page.tsx` | `font-arabic-reading` | Bookmarked verse preview |

### Arabic Watermark on Surah Cards — EXACT SPEC

The Arabic name appears as a large decorative watermark on each surah card in the browse grid. This is the code that keeps getting broken:

```tsx
// src/presentation/components/quran/surah-browser-brutalist.tsx — SurahCard
<p
  className={cn(
    "absolute right-3 select-none pointer-events-none transition-opacity duration-300 z-[4] arabic-display",
    featured
      ? "text-[6rem] sm:text-[8rem] opacity-[0.15] group-hover:opacity-[0.25] top-[10%] bottom-8"
      : "text-[3.5rem] sm:text-[4.5rem] opacity-[0.12] group-hover:opacity-[0.22] top-[5%] bottom-8",
  )}
  dir="rtl"
  aria-hidden="true"
  style={{
    color: isBg ? "#0a0a0a" : undefined,      // dark on accent bg, inherit elsewhere
    display: "flex",
    alignItems: "center",                       // vertically centers the text
    lineHeight: 1,                              // override the class line-height
  }}
>
  {surah.nameArabic}
</p>
```

**Key details:**
- `absolute right-3` — anchored to right side of card
- `top-[10%] bottom-8` (featured) / `top-[5%] bottom-8` (regular) — spans card height
- `display: flex; alignItems: center` — vertically centers within that span
- `lineHeight: 1` — overrides the class `line-height: 2.4` to keep text compact
- `text-[6rem] sm:text-[8rem]` (featured) / `text-[3.5rem] sm:text-[4.5rem]` (regular)
- The parent card has `overflow-hidden` so oversized text clips naturally
- Card min-heights: `min-h-[220px]` (featured), `min-h-[160px]` (regular)

**DO NOT:**
- Replace with `inset-0` — breaks the right-aligned positioning
- Use container query units (`cqh`) — not supported without container ancestor setup
- Use `clamp()` with viewport units — produces inconsistent sizes
- Change the font class from `arabic-display` to anything else
- Remove the `lineHeight: 1` override — text becomes double-spaced and tiny

---

## Design System

### Visual Language: Brutalist / Editorial

- **Zero border radius** everywhere (`--radius-*: 0px`)
- **Hard borders** (`border-border`)
- **Monospace labels** — `font-mono text-[10px] uppercase tracking-[0.15em]`
- **Bracketed sections** — `[ SECTION NAME ]` via `BracketLabel` component
- **Display headings** — `font-display` (Space Grotesk)
- **Graph paper background** — subtle CSS grid on `body`
- **No shadows** on cards — only on nav bar and hover states

### Font Stack

| Token | Font | Usage |
|-------|------|-------|
| `--font-display` | Space Grotesk | Headings, surah names, display text |
| `--font-mono` | Space Mono | Labels, numbers, metadata, UI chrome |
| `--font-arabic-display` | Amiri | Arabic headers, watermarks, Bismillah |
| `--font-arabic-reading` | Scheherazade New | Verse text, reading Arabic |

### Color System

All colors use CSS custom properties that adapt to light/dark mode. **Never use hardcoded hex colors** — always reference the CSS vars.

#### Surah Palette (4 rotating colors)

| Color | CSS Var Prefix | Used For |
|-------|---------------|----------|
| Yellow | `--surah-yellow-*` | Surah 1, 5, 9... / Meccan dot / highlights |
| Pink | `--surah-pink-*` | Surah 2, 6, 10... / Da'if grade |
| Teal | `--surah-teal-*` | Surah 3, 7, 11... / Medinan dot / Sahih grade |
| Lavender | `--surah-lavender-*` | Surah 4, 8, 12... / topic chips |

Each color has 4 variants:
- `--surah-{color}-bg` — Light tinted background
- `--surah-{color}-accent` — Vibrant accent (card bg, progress bars)
- `--surah-{color}-label` — Text color for labels/pills on tinted bg
- `--surah-{color}-text` — Text color on accent bg

#### Key Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | white | `hsl(0 0% 6%)` | Page background |
| `--foreground` | near-black | `hsl(0 0% 93%)` | Primary text |
| `--surface` | `hsl(0 0% 96%)` | `hsl(0 0% 10%)` | Card/surface bg |
| `--highlight` | `#fefce8` | `rgba(232,227,55,0.12)` | Active/selected state |
| `--border` | `hsl(0 0% 85%)` | `hsl(0 0% 18%)` | Borders |

#### Surah Color Utility

```typescript
// src/lib/surah-colors.ts
import { getSurahColor } from "@/lib/surah-colors";
const color = getSurahColor(surahId); // deterministic: same surah = same color always
// color.bg, color.accent, color.label, color.text
```

### Dark Mode

- Implemented via `next-themes` with `attribute="class"`
- `ThemeProvider` wraps the app in `layout.tsx`
- `ThemeToggle` in top-nav uses `mounted` state to avoid hydration mismatch
- Featured card text is always `#0a0a0a` (dark on vibrant accent bg, which stays vibrant in both modes)
- Continue Reading button text is always `#0a0a0a` for same reason

### Tailwind Gotcha — Dynamic Colors

Dynamic Tailwind classes from JS objects get **PURGED** in production.

```tsx
// BAD — will be purged:
className={`border-l-${color}`}

// GOOD — use inline styles:
style={{ borderLeft: `3px solid ${color.accent}` }}
```

---

## Architecture

### Clean Architecture Layers

```
core/        — types, ports (interfaces), services (business logic)
infrastructure/ — adapters (API, DB), data fetching
presentation/   — components, hooks, providers
lib/            — utilities (surah-colors, DI container, etc.)
```

### Key Patterns

- **DI Container**: `src/lib/di.ts` — `container.register()` / `container.resolve()`
- **Server-only wiring**: `src/lib/services.ts` (uses `server-only` package)
- **Local-first adapters**: `TranslationLocalAdapter`, `TafsirLocalAdapter`, `HadithLocalAdapter`
- **Panel system**: `PanelProvider` context + `PanelLayout` with `react-resizable-panels` v4
- **Dexie (IndexedDB)**: Notes, bookmarks, reading progress — schema at v7

### Important Components

| Component | Location | Notes |
|-----------|----------|-------|
| `SurahBrowserBrutalist` | `quran/surah-browser-brutalist.tsx` | Browse grid with sidebar filters |
| `HadithBrowser` | `hadith/hadith-browser.tsx` | Collection → Book → Hadith drill-down |
| `VerseBlock` | `reading/verse-block.tsx` | Main verse display with DOMPurify |
| `TopNav` | `layout/top-nav.tsx` | Fixed nav with theme toggle, panels dropdown |
| `BracketLabel` / `RadioOption` | `ui/bracket-helpers.tsx` | Shared brutalist form components |

### Browse Page — Surah Card Grid

- 3-column grid (`grid-cols-2 sm:grid-cols-3`)
- **Important surahs** (Al-Fatihah, Al-Baqarah, Ya-Sin, etc.) span 2 columns with colored accent backgrounds
- Non-adjacent featured rule: two featured cards never appear in sequence
- **Meccan** surahs show Kaaba icon, **Medinan** show Masjid icon
- Progress bar: 2px accent-colored bar at card bottom
- Hover: scale up + surah-color bg fill + accent bar from left

---

## Dev Server

```bash
npx next dev -p 5555
```

## Next.js 16 Notes

- Route params are Promises — must `await params`
- `suppressHydrationWarning` on `<html>` for next-themes
- `useSearchParams()` requires Suspense boundary

## Git Rules

- **Never** add `Co-Authored-By` to commits
- Commit under user's name only

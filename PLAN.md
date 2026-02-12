# The Primer — v0.0 Implementation Plan

## Vision

VS Code for the Quran — a personal knowledge system disguised as a reading app. Immersive reading, layered depth, personal knowledge building, and an interface that feels like the future.

**The luxury:** The luxury of time and peace. You have all the time in the world to study, understand, ask questions, go back. No rush. No gamification. No streaks. Just depth.

**UI direction:** Two distinct modes from day zero — not inverses of each other:

- **Light Mode: "The Library"** — Warm ivory, paper-like depth, scholarly serenity. Think: a private reading room in a centuries-old library with afternoon sunlight through tall windows. Gold ink on cream paper.
- **Dark Mode: "The Observatory"** — Deep cosmic navy, amber glows, glass panels with depth. Think: a scholar's command center at midnight, information radiating from focus points, holographic depth.

Both share gold/amber as the connective thread, but each has its own atmosphere, shadows, and personality.

Design DNA: Lumina Study's warm scholarly elegance + Manus Quran's workspace architecture + original refinements.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Repo | `quran-primer` → github.com/sadiash/quran-primer |
| License | AGPL-3.0 (open core, protects against closed forks) |
| Stack | Next.js 15+ (App Router), React 19, TypeScript strict, Tailwind v4 |
| Data | Dexie.js (client IndexedDB) + PostgreSQL/Drizzle (server) |
| Auth | Optional (works without login, auth adds cloud sync) |
| Theme | Dual-mode from day zero: "The Library" (light) + "The Observatory" (dark) |
| Testing | Vitest + React Testing Library + MSW |
| CI | GitHub Actions: lint → type-check → test → build |

---

## Parallel Work Streams

### What CAN be done in parallel (separate Claude windows):

```
Stream B (Design System)  ←→  Stream C (Core Architecture)
  - No dependencies between them
  - B builds visual foundation, C builds data/logic foundation
  - Both depend on Stream 0 + A being complete

Stream E (Study Features)  ←→  Stream F (Audio + Tafsir)  ←→  Stream G (Command Palette)
  - All three depend on Stream D (Reading Surface)
  - But are independent of each other
```

### What MUST be serial:

```
Stream 0 (Scaffold) → Stream A (Tests) → [B | C] → Stream D (Reading Surface) → [E | F | G] → Stream H (Polish)
```

### Recommended parallel assignments:

| Phase | Window 1 | Window 2 | Window 3 |
|-------|----------|----------|----------|
| 1 | Stream 0 + A (serial) | — | — |
| 2 | Stream B (Design System) | Stream C (Core Architecture) | — |
| 3 | Stream D (Reading Surface) | Stream C4 (DB Layer, if not done) | — |
| 4 | Stream E (Study Features) | Stream F (Audio + Tafsir) | Stream G (Command Palette) |
| 5 | Stream H (Polish + Integration) | — | — |

---

## Parallel Delegation Guide — Handoff to Separate Claude Windows

### Dependency Graph

```
Stream 0 (Scaffold) ──→ Stream A (Tests)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            Stream B (Design)    Stream C (Architecture)
                    │                   │
                    └─────────┬─────────┘
                              ▼
                     Stream D (Reading Surface)
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
        Stream E (Study) Stream F (Audio) Stream G (Cmd Palette)
               │              │              │
               └──────────────┼──────────────┘
                              ▼
                     Stream H (Polish)
```

### Phase 1: SERIAL — 1 window

**Stream 0 + Stream A** must be done first, in this window. Creates the project skeleton (Next.js, TypeScript, deps, tests, Quran data) that everything builds on. Cannot parallelize.

---

### Phase 2: PARALLEL — 2 windows

Once Stream 0 + A are committed and pushed, hand off to two separate Claude windows:

#### Window A — Stream B: Design System

**Files touched:** `src/design/`, `src/app/globals.css`, `src/presentation/components/ui/`

**Handoff prompt:**
> Clone github.com/sadiash/quran-primer. Read PLAN.md — specifically Stream B (Design System). Read references/lumina-study for design DNA (warm scholarly elegance). Build the entire design system:
> - Phase B1: Design tokens in `src/design/tokens.ts` — both "The Library" (light) and "The Observatory" (dark) designed as independent aesthetics, not inverses. Gold/amber is the shared thread.
> - Phase B2: CSS foundation in `src/app/globals.css` — Tailwind v4 @theme, glass utilities, glow utilities, gradients, animations.
> - Phase B3: Primitive UI components in `src/presentation/components/ui/` — button, icon-button, dialog, input, textarea, badge, skeleton, toast, tooltip, divider. All with tests, accessibility, keyboard support.
> Commit after each phase (B1, B2, B3). Push when done.

**Why it's safe to delegate:** Touches only design/presentation files. Zero overlap with Stream C.

#### Window B — Stream C: Core Architecture

**Files touched:** `src/core/`, `src/infrastructure/`, `src/lib/`

**Handoff prompt:**
> Clone github.com/sadiash/quran-primer. Read PLAN.md — specifically Stream C (Core Architecture). Build the entire core:
> - Phase C1: Domain types and port interfaces in `src/core/types/` and `src/core/ports/`.
> - Phase C2: Infrastructure utilities in `src/infrastructure/` — HttpClient, CircuitBreaker, LRU cache, Pino logger, DI container, env validation. All in `src/infrastructure/http/`, `cache/`, `logging/`, `src/lib/`.
> - Phase C3: Data adapters in `src/infrastructure/adapters/` — QuranLocalAdapter (reads bundled JSON from `data/quran/`), QuranTranslationAdapter (Quran.com API v4), TafsirAdapter, HadithAdapter, AudioAdapter. Plus QuranService in `src/core/services/`.
> - Phase C4: Database layer in `src/infrastructure/db/` — Dexie client schema + Drizzle/PostgreSQL server schema. Dual repos implementing shared interfaces from ports. Tests using fake-indexeddb.
> No React/UI code. Commit after each phase (C1, C2, C3, C4). Push when done.

**Why it's safe to delegate:** Touches only core/infrastructure/lib. Zero overlap with Stream B.

---

### Phase 3: SERIAL — 1 window

**Stream D: Reading Surface** — Depends on BOTH B and C being complete. This is the glue: app shell, layout, providers, home page, surah browser, reading surface, API routes. Wires design system + architecture together. Hard to split.

---

### Phase 4: PARALLEL — 3 windows

Once Stream D is committed and pushed, hand off to three separate Claude windows:

#### Window C — Stream E: Study Features

**Files touched:** `src/presentation/hooks/`, `src/presentation/components/` (bookmarks, notes, progress UIs), `src/app/(workspace)/notes/`, `src/app/(workspace)/bookmarks/`

**Handoff prompt:**
> Clone github.com/sadiash/quran-primer. Read PLAN.md — specifically Stream E (Study Features). Build:
> - Phase E1: React hooks for Dexie — `use-bookmarks.ts`, `use-notes.ts`, `use-progress.ts`, `use-preferences.ts`, `use-scroll-position.ts`, `use-verse-visibility.ts` in `src/presentation/hooks/`.
> - Phase E2: Working bookmarks — wire into verse-display, visual states, bookmarks list page.
> - Phase E3: Note editor — glass dialog, tags, notes list page.
> - Phase E4: Reading progress — IntersectionObserver auto-tracking, progress bars on surah cards, continue reading.
> All with tests. Commit after each phase (E1-E4). Push when done.

#### Window D — Stream F: Audio + Tafsir

**Files touched:** `src/presentation/providers/audio-provider.tsx`, `src/presentation/components/layout/audio-dock.tsx`, `src/presentation/components/study/`, `src/app/(workspace)/study/`

**Handoff prompt:**
> Clone github.com/sadiash/quran-primer. Read PLAN.md — specifically Stream F (Audio + Tafsir). Build:
> - Phase F1: AudioProvider context, play/pause/stop, HTML5 Audio. Wire play button in verse actions. AudioDock glass bar with controls. Currently-playing verse highlight animation. Keyboard spacebar play/pause.
> - Phase F2: Study view page at `/study/[key]/`. TafsirPanel with scholar selector, DOMPurify-sanitized HTML. HadithPanel with collection/grade badges. Loading/error/empty states.
> All with tests. Commit after each phase (F1, F2). Push when done.

#### Window E — Stream G: Command Palette

**Files touched:** `src/presentation/components/ui/command-palette.tsx`, `src/presentation/hooks/use-command-palette.ts`

**Handoff prompt:**
> Clone github.com/sadiash/quran-primer. Read PLAN.md — specifically Stream G (Command Palette). Build:
> - Phase G1: Command palette using `cmdk` library. Glass overlay, backdrop blur, Framer Motion scale-in. Global Cmd+K / Ctrl+K listener. Commands: go to surah (fuzzy match Arabic + English), go to verse ("2:255"), toggle dark/light, toggle Arabic. Command groups with headers. Recent/frequent commands rise to top.
> All with tests. Commit after each phase. Push when done.

**Why Phase 4 parallelizes:** E touches hooks + bookmark/note UIs. F touches audio provider + study components. G touches command palette only. Minimal file overlap — they all import shared UI primitives from Stream B but don't modify them.

---

### Phase 5: SERIAL — 1 window

**Stream H: Accessibility + Responsive + Polish + Integration Testing** — Touches every file. Must be last. One window audits and polishes the complete app.

---

### Summary

```
Total windows needed across the build:     5 (not all at once)
Max concurrent windows at any point:        3 (Phase 4)

Phase 1:  1 window   Stream 0 + A         (serial, creates skeleton)
Phase 2:  2 windows  Stream B | Stream C   (design + architecture, zero overlap)
Phase 3:  1 window   Stream D              (reading surface, wires B + C)
Phase 4:  3 windows  Stream E | F | G      (features, minimal overlap)
Phase 5:  1 window   Stream H              (polish, touches everything)
```

---

## Stream 0: Git Repo + Project Scaffold

### Phase 0.1: Repository Setup
- [x] `git init` in fresh directory
- [ ] `.gitignore` — Next.js + Node + env + IDE + OS
- [ ] `LICENSE` — AGPL-3.0
- [ ] `README.md` — project name, one-liner, WIP badge
- [ ] Initial commit

### Phase 0.2: Next.js Bootstrap
- [ ] `create-next-app` with TypeScript, Tailwind, ESLint, App Router, src dir
- [ ] `tsconfig.json` — strict, noUncheckedIndexedAccess, noImplicitReturns
- [ ] `.prettierrc` — semi, double quotes, 100 width
- [ ] ESLint config — next/core-web-vitals + typescript
- [ ] Verify dev/build/lint
- [ ] Delete boilerplate
- [ ] Commit

### Phase 0.3: Project Structure
```
src/
├── app/                    # Next.js routes + API routes
│   ├── api/v1/            # Versioned API
│   ├── (workspace)/       # Route group: main workspace
│   └── layout.tsx         # Root layout
├── core/                   # Domain layer (zero framework imports)
│   ├── types/             # Domain entities + value objects
│   ├── ports/             # Interface contracts
│   └── services/          # Business logic
├── infrastructure/         # External world
│   ├── adapters/          # Port implementations
│   ├── db/                # Dexie + Drizzle schemas
│   ├── http/              # HttpClient, CircuitBreaker
│   ├── cache/             # LRU cache
│   └── logging/           # Structured logger
├── presentation/           # React layer
│   ├── components/
│   │   ├── layout/        # Shell, sidebar, topbar, dock
│   │   ├── quran/         # Reading surface components
│   │   ├── study/         # Study panels
│   │   └── ui/            # Shared primitives
│   ├── hooks/             # Custom React hooks
│   └── providers/         # Context providers
├── lib/                    # Shared utilities
├── design/                 # Design tokens + theme
└── test/                   # Test utilities
data/                       # Bundled Quran data (static JSON)
└── quran/
```

### Phase 0.4: Core Dependencies
- Runtime: @tanstack/react-query, zod, pino, dexie, dexie-react-hooks, drizzle-orm, pg, dompurify, next-themes
- Dev: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, happy-dom, fake-indexeddb, msw, drizzle-kit
- Design: framer-motion, cmdk, lucide-react
- Fonts: @fontsource/inter, Arabic fonts via next/font

### Phase 0.5: Quran Data Seeding
- Seed script fetches 114 surahs from API
- Writes `data/quran/metadata.json` + `data/quran/surahs/001.json`–`114.json`
- Verify: 114 files, 6236 verses, textUthmani + textSimple

**Gate:** Clean project, strict TS, all deps, all Quran data bundled.

---

## Stream A: Test Infrastructure + CI

### Phase A1: Test Setup
- `vitest.config.ts` with path aliases, happy-dom, v8 coverage
- `src/test/setup.ts` with fake-indexeddb polyfill
- `src/test/helpers/test-utils.tsx` custom render
- `src/test/helpers/mock-data.ts` typed factories
- Scripts: test, test:watch, test:coverage
- First passing test

### Phase A2: CI Pipeline
- `.github/workflows/ci.yml` — lint → type-check → test → build
- Verify locally

**Gate:** `npm test` passes. CI defined.

---

## Stream B: Design System — "The Glow" (PARALLELIZABLE)

### Phase B1: Design Tokens + Theme

Both modes designed independently with their own personality:

**Light Mode — "The Library":**
- Background: warm ivory (#FAF5F0 range)
- Text: espresso/warm charcoal
- Primary: rich gold (#C9A227 → #D4AF37)
- Accent: scholarly teal
- Shadows: warm, paper-like depth
- Glass: frosted cream, 16px blur

**Dark Mode — "The Observatory":**
- Background: deep cosmic navy (#0D1117 → #0F1525)
- Text: soft silver
- Primary: bright amber/gold (#FFDC5C → #F4D03F)
- Accent: cyan sparks
- Shadows: ambient glow
- Glass: deep blue-tinted, 20px blur

Shared:
- Typography: Amiri Quran (Arabic display), Scheherazade New (Arabic reading), Inter (UI), serif accent for headings
- Spacing: 4px grid, Arabic line-height 2.4-2.8
- Animation tokens: 150ms micro, 300ms standard, 500ms emphasis
- HSL-based CSS variables for systematic control

### Phase B2: CSS Foundation
- Tailwind v4 @theme with all tokens
- CSS variables for both modes (each designed independently)
- Base styles: scrollbar, selection, focus ring
- Arabic text defaults
- Glass utilities, glow utilities, gradient utilities, animation utilities

### Phase B3: Primitive UI Components
- button, icon-button, dialog, input, textarea
- badge, skeleton, toast, tooltip, divider
- All with tests, accessibility, keyboard support

**Gate:** Design system is standalone, tested, beautiful in both modes.

---

## Stream C: Core Architecture (PARALLELIZABLE with B)

### Phase C1: Domain Types + Ports
- Surah, Verse, Word, Translation, Tafsir, AudioRecitation, Hadith
- Bookmark, Note, ReadingProgress, UserPreferences
- API envelope: ApiResponse<T>
- Port interfaces for all data sources

### Phase C2: Infrastructure Utilities
- HttpClient with retry, backoff, circuit breaker
- CircuitBreaker (3-state)
- LRU Cache with TTL
- Logger (Pino structured)
- API response helpers
- DI Container
- Env validation (Zod)

### Phase C3: Data Adapters
- QuranLocalAdapter (bundled JSON)
- QuranTranslationAdapter (Quran.com API v4, batch per surah)
- QuranAudioAdapter, TafsirAdapter, HadithAdapter
- QuranService combining ports

### Phase C4: Database Layer
- Dexie schema (bookmarks, notes, progress, preferences)
- Drizzle schema (same + userId)
- Docker compose for PostgreSQL
- Dual repos implementing shared interfaces

**Gate:** Full architecture. Types → Ports → Adapters → Services → Repos → DB.

---

## Stream D: Reading Surface — "The Heart"

### Phase D1: App Shell + Layout
- Root layout with fonts, providers, theme script
- ThemeProvider (next-themes), QueryProvider
- AppShell: activity bar + main + side panel
- ActivityBar, TopBar, MobileNav, AudioDock
- Security headers middleware

### Phase D2: Home / Landing
- First visit: minimal onboarding (3 steps max)
- Returning: resume where you left off
- "Continue Reading" card, quick actions

### Phase D3: Surah Browser
- Grid of 114 surah cards (glass panels)
- Search/filter, progress indicators
- Skeleton loading states

### Phase D4: Reading Surface (The Core)
- Continuous prose layout (NOT individual cards)
- Arabic + translation, verse number ornaments ﴿١﴾
- Verse actions on hover/long-press
- Scroll state persistence, IntersectionObserver

### Phase D5: API Routes
- GET /api/v1/surahs, /surahs/[id], /search, /tafsir, /hadith, /audio, /health
- Consistent API envelope

**Gate:** Beautiful reading experience in both themes.

---

## Stream E: Study Features (PARALLELIZABLE with F, G)

- React hooks for Dexie (bookmarks, notes, progress, preferences)
- Working bookmarks with persistence
- Note editor with tags
- Reading progress auto-tracking
- All with tests

---

## Stream F: Audio + Tafsir (PARALLELIZABLE with E, G)

- AudioProvider + AudioDock
- Verse highlighting during playback
- Study view with tafsir panel
- Hadith panel
- DOMPurify for HTML content

---

## Stream G: Command Palette (PARALLELIZABLE with E, F)

- Cmd+K / Ctrl+K global shortcut
- Go to surah, go to verse, toggle theme
- Fuzzy matching, command groups
- Recent/frequent rise to top

---

## Stream H: Accessibility + Responsive + Polish

- ARIA labels, skip-to-content, lang="ar" + dir="rtl"
- Color contrast audit (WCAG AA)
- Focus management, screen reader support
- prefers-reduced-motion
- Responsive: 320px → 1440px
- Page transitions, skeleton screens, error boundaries
- 404 page, empty states

---

## Integration Tests

- Cold start, first-time user, returning user
- Read surah, bookmark, note, audio, study, command palette
- Theme toggle, progress tracking, responsive, keyboard nav
- Offline capability, CI green

---

## Total: ~165 checklist items across 8 streams

# V2 Next Steps

Tech debt and improvements identified from a codebase audit against PLAN.md standards.

---

## HIGH — Architecture

### God files (14 files over 300 lines)

Extract into smaller, focused components and custom hooks.

| File | Lines | Suggested split |
|------|-------|-----------------|
| `drawer/notes-section.tsx` | 1093 | `NoteCard`, `NoteEditor`, `NotesList`, `useNotesPanel` hook |
| `settings/page.tsx` | 925 | `AppearanceSection`, `ReadingSection`, `StudySection`, `DataSection` (already exists but inline) |
| `notes/page.tsx` | 838 | `NotesPageHeader`, `NotesGrid`, `NoteDetailSheet`, `useNotesPage` hook |
| `reading/verse-block.tsx` | 600 | `ArabicText`, `TranslationBlock`, `ConceptTags`, `VerseNumber` |
| `onboarding/page.tsx` | 505 | Steps are already separate functions — extract to files |
| `reading/reading-surface.tsx` | 487 | `useReadingSurface` hook, `TranslationLegend`, `VerseList` |
| `knowledge-graph-service.ts` | 470 | `GraphBuilder`, `GraphEnricher`, `GraphSerializer` |
| `drawer/hadith-section.tsx` | 452 | `HadithSearchBar`, `HadithFilters`, `HadithResultsList`, `ConceptResults` |
| `network-graph.tsx` | 396 | Already has hook extraction — needs component split |
| `hadith-card.tsx` | 316 | `HadithCardHeader`, `HadithCardBody`, `HadithGradeBadge` |
| `layout/top-nav.tsx` | 302 | `ThemeDropdown` and `PanelsDropdown` to own files |
| `drawer/tafsir-section.tsx` | 301 | `TafsirPills`, `TafsirContent` |
| `bookmarks/page.tsx` | 329 | `BookmarkCard`, `BookmarkFilters` |

---

## HIGH — Input Validation

### Add Zod schemas to all API routes

Currently routes validate manually with string checks. Replace with Zod at boundaries.

```
src/lib/api-schemas.ts          — shared schemas (verseKey, surahId, pagination)
src/app/api/v1/tafsir/schema.ts — per-route schemas
```

Routes to update:
- `/api/v1/tafsir` — verse_key, tafsir_id
- `/api/v1/translations` — surah_id
- `/api/v1/search` — q, surah
- `/api/v1/hadith` — q, collection
- `/api/v1/hadith/browse` — collection, book
- `/api/v1/hadith/related` — verse
- `/api/v1/hadith/concept-search` — verse, exclude
- `/api/v1/surahs/[id]` — id param
- `/api/v1/audio` — surah, reciter
- `/api/v1/cross-references` — verse_key
- `/api/v1/ontology` — surah
- `/api/v1/export` — payload body

---

## HIGH — Rate Limiting

No endpoints are rate-limited. Add at minimum:

| Tier | Endpoints | Limit |
|------|-----------|-------|
| Strict | `/sign-in`, `/sign-up` | 10 req/min per IP |
| Standard | `/api/v1/search`, `/api/v1/hadith` | 60 req/min per IP |
| Relaxed | All other API routes | 120 req/min per IP |

Options: `@upstash/ratelimit` (serverless-friendly) or Vercel's built-in edge rate limiting.

---

## MEDIUM — Missing Tests

4 API routes have no test coverage:

- [ ] `src/app/api/v1/export/route.ts`
- [ ] `src/app/api/v1/hadith/browse/route.ts`
- [ ] `src/app/api/v1/hadith/concept-search/route.ts`
- [ ] `src/app/api/v1/hadith/related/route.ts`

Follow existing test patterns in `src/app/api/v1/**/*.test.ts`.

Overall: 32 test files / 223 source files = 14% file coverage. Target 40%+ starting with API layer and core services.

---

## MEDIUM — Observability

### Request ID tracing

Add a request ID to every API call for log correlation:

- Generate UUID in `proxy.ts` (or use Vercel's `x-vercel-id` header)
- Pass through to `createLogger()` context
- Return in `X-Request-Id` response header

### Silent error swallowing

These files catch localStorage errors silently — add `console.warn`:

- `src/presentation/components/drawer/hadith-section.tsx` (lines 29-37, 40-49)
- `src/app/(app)/notes/page.tsx` (lines 22-28, 31-37)

---

## MEDIUM — Surah Validation

Centralize surah ID validation (1-114) into a shared helper. Currently each route validates differently or not at all.

```ts
// src/lib/api-schemas.ts
export const surahId = z.coerce.number().int().min(1).max(114);
export const verseKey = z.string().regex(/^\d{1,3}:\d{1,3}$/);
```

---

## LOW — Per-User Data

Currently all data (notes, bookmarks, settings, progress) is in browser IndexedDB via Dexie — not tied to the Clerk user.

Options:
1. **Scope IndexedDB by user ID** — quick, keeps local-first, no cross-device sync
2. **Server database** — Postgres/Supabase keyed by Clerk user ID, enables cross-device sync

Decision depends on whether cross-device sync is needed.

# The Primer

> VS Code for the Quran — a personal knowledge system disguised as a reading app.

![WIP](https://img.shields.io/badge/status-WIP-orange)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

## What is this?

A place where you can peacefully read the Quran and never lose context — no matter how deep you dive. Every verse is a doorway into translations, commentary, hadith, cross-scripture references, and your own evolving understanding. The app remembers everything, connects everything, and meets you exactly where you left off.

## Features

**Reading**
- Immersive reading surface with Arabic + multiple translations
- Zen mode, adjustable verse density, compact/comfortable layouts
- 8 themes (4 light, 4 dark) — from warm scholarly "Library" to cosmic "Observatory"

**Study**
- Tafsir panel (Ibn Kathir, Al-Jalalayn) with verse-linked navigation
- Hadith panel with search + browse, grade filters, 6 collections (33,738 hadiths)
- Cross-scripture references via Scripturas.info

**Personal Knowledge**
- Rich note editor (TipTap) with titles, tags, verse/surah references
- Link hadith and tafsir directly to notes
- Pin, sort, search, export (JSON/Markdown), import notes
- Mind map visualization of your knowledge graph (ReactFlow)

**Navigation**
- Command palette (Cmd+K) — jump to any surah, toggle settings
- Workspace presets (Daily Reading, Deep Study)
- Multi-dock resizable panel layout

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict
- **Styling**: Tailwind CSS v4 with HSL design tokens
- **Data**: Local-first (bundled JSON) with API fallback, Dexie (IndexedDB) for user data
- **Editor**: TipTap (rich text), ReactFlow (mind map), cmdk (command palette)

## Getting Started

```bash
npm install
npm run dev -- -p 5555
```

Open [http://localhost:5555](http://localhost:5555).

## Bundled Data

All core data is bundled locally — no internet required for reading:

| Data | Size |
|------|------|
| Arabic text (114 surahs) | 3.5 MB |
| Translations (5 × 114 files) | 6.4 MB |
| Tafsirs (2 × 114 files) | 41 MB |
| Hadith (6 collections, 33,738 hadiths) | 20 MB |

## Architecture

Clean Architecture with dependency injection:

```
src/
├── core/           # Domain types, ports (interfaces), services
├── infrastructure/  # Adapters, database (Dexie), HTTP client
├── presentation/    # React components, hooks, providers
├── lib/            # DI container, utilities
└── app/            # Next.js routes + API routes
data/               # Bundled Quran, translation, tafsir, hadith JSON
```

See [docs/PLAN.md](docs/PLAN.md) for detailed implementation status.

## License

[AGPL-3.0](LICENSE)

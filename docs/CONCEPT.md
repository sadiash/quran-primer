# The Primer — A Quran Study Companion

*Inspired by The Diamond Age: a deeply personal, infinitely patient, contextually aware companion that meets you where you are and goes as deep as you want to go.*

---

## Vision

A place where you can peacefully read the Quran and never lose context — no matter how deep you dive. Every verse is a doorway into an entire world of knowledge: translations, commentary, hadith, history, cross-scripture references, scholarly lectures, and your own evolving understanding. The app remembers everything, connects everything, and meets you exactly where you left off.

This is not a reading app. This is a **personal knowledge system** built around the Quran.

---

## Core Experience

### 1. Immersive Reading

Read the Quran in its original Arabic with multiple translations displayed simultaneously. Choose which translations you want side by side. Adjust font sizes, switch between reading modes (focused Arabic, parallel translation, study mode). The reading experience is peaceful, beautiful, and distraction-free.

**When you come back, you're exactly where you left off.** Your reading state is preserved across sessions — the surah, the verse, the scroll position, even which panels you had open.

### 2. Deep Study — Without Losing Context

From any verse, open layers of understanding:

- **Tafsir** — Classical commentaries (Ibn Kathir, Al-Jalalayn, Al-Tabari, etc.) and modern interpretations, displayed in a side panel that doesn't take you away from the verse
- **Hadith** — Relevant hadith automatically surfaced for the verse you're reading, with chains of narration and grading
- **Historical context** — When was this revealed? What was happening? What events does it reference? The circumstances of revelation (Asbab al-Nuzul)
- **Cross-scripture references** — How does the Torah reference this story? What does the Bible say? How is it recorded in Babylonian, Egyptian, or other historical records? Comparative religion at your fingertips
- **Stories and narratives** — The full arc of Quranic stories (Prophets, nations, parables) traced across surahs, connected together
- **Modern scholarship** — Contemporary scholars' interpretations and analysis

Every layer opens in context — within the same screen, as a panel that slides open beside or over the text. You can go three levels deep into a hadith chain, read a cross-reference in Genesis, watch a lecture — and one tap collapses everything back to the exact verse you started from. **The breadcrumb trail never breaks. The reading position never moves.**

### 3. Multimedia Integration

- **Video lectures and animations** linked to surahs, verses, and themes
- **Audio recitation** with multiple reciters, verse-by-verse highlighting
- **Scholar preferences** — "I want recommendations from Sheikh Y but not from X." Your trust graph shapes what surfaces. You control whose interpretations you see
- **Curated content** — Beautiful animated explanations, documentaries, lecture series, all linked to the relevant verses

### 4. Personal Knowledge Building

#### Rich Bookmarks
Not just a single verse. Bookmark:
- A single ayah
- An entire surah
- A passage range (e.g., Surah Al-Baqarah, verses 40-73 — the story of Bani Israel)
- A thematic thread across multiple surahs

Each bookmark can have labels, colors, categories, and notes attached.

#### Rich Notes
Your notes are a personal knowledge base. You can:
- Type notes on any verse or passage
- **Voice-record notes** that are automatically transcribed
- Pull in excerpts from tafsir, hadith, cross-references, or any source you're viewing — and it's automatically linked back to the original
- Add external links (YouTube videos, articles, PDFs)
- Tag and categorize for retrieval
- Notes are linked to verses but also to each other — your understanding grows as a connected web, not isolated fragments

#### Mind Maps

Generate visual mind maps on the fly from your notes, bookmarks, or any combination:

- **From a verse** — See everything connected to it: your notes, bookmarks, tafsir you've read, hadith you've saved, cross-references, themes. The verse is the center; your knowledge radiates outward.
- **From a theme** — Pick "patience" and see every verse you've bookmarked, every note you've written, every tafsir excerpt you've clipped on that theme — connected visually as a map.
- **From a bookmark collection** — Turn a set of bookmarks into a visual web. See how your saved passages relate to each other across surahs.
- **Grow over time** — Mind maps aren't static snapshots. As you add more notes and bookmarks, the map grows. Revisit it weeks later and see new connections you didn't notice before.
- **Open from anywhere** — Reading a verse and want to see your knowledge web around it? One tap. The mind map opens as a layer (stays within the one-screen model) and you can tap any node to dive into that note, bookmark, or verse.

Mind maps are a *window into your own understanding* — a way to see the structure of what you've learned, not just a list of what you've saved.

#### Theme-Based Cross-Referencing
As you read, the system highlights:
- **Themes you've encountered before** — "You read about patience in Surah Al-Asr and also in Surah Al-Baqarah 2:153. Here it is again."
- **Your own notes on similar topics** — "You wrote about this theme 3 weeks ago while reading Surah Yusuf"
- **Connections you haven't seen yet** — Verses that share vocabulary, themes, or narrative threads with what you're currently reading

This is not just search. It's **ambient awareness** of your own learning journey.

### 5. LLM-Powered Intelligence

LLMs are not a feature bolted on. They are woven into the fabric of the experience:

- **Ask questions in context** — "What does this word mean in classical Arabic?" "Why is this story told differently in Surah Al-A'raf vs Surah Ta-Ha?" "How do Sunni and Shia scholars interpret this verse differently?"
- **Summarize** — "Give me a summary of the themes in the last 10 verses I read"
- **Connect** — "What other verses in the Quran discuss the same concept?" "What hadith relate to this?"
- **Explain** — "Explain this tafsir in simpler terms" "What's the historical background of this revelation?"
- **Translate your notes** — Work in any language, the LLM bridges
- **Surface insights** — "Based on your reading patterns and notes, you seem interested in Quranic stories about prophets. Here are verses you haven't read yet on this theme."

**Every LLM interaction is validated.** Quranic text in AI responses is checked against the authentic source (quran-validator). The AI never misquotes the Quran.

---

## Data Model (Knowledge Graph)

Every piece of content is a **node**. Connections between nodes are the real value.

```
Verse ──── has many ──── Translations
  │
  ├─── has many ──── Tafsirs (multiple scholars, eras)
  │
  ├─── relates to ──── Hadith (with chains, grading)
  │
  ├─── cross-references ──── Other Scripture (Torah, Bible, historical records)
  │
  ├─── belongs to ──── Themes (patience, gratitude, justice, prophets, ...)
  │
  ├─── has ──── Historical Context (Asbab al-Nuzul, era, location)
  │
  ├─── linked to ──── Media (videos, lectures, animations)
  │
  └─── user layer:
        ├─── Bookmarks (single verse, range, surah, theme)
        ├─── Notes (typed, voice-transcribed, with embedded references)
        ├─── Reading Progress (position, history, streaks)
        ├─── LLM Conversations (contextual Q&A tied to verses)
        └─── Mind Maps (generated from notes, bookmarks, themes — visual knowledge graphs)

User ──── has ──── Preferences
  │                  ├── Scholar trust graph (show/hide recommendations)
  │                  ├── Display settings (fonts, translations, layout)
  │                  └── Reciter preferences
  │
  ├─── has ──── Notes (connected to each other + to verses)
  │
  └─── has ──── Reading Journey (progress, patterns, themes explored)

Theme ──── connects ──── Verses across surahs
  │
  └─── connects ──── User Notes across sessions
```

---

## Open Source & Distribution Model

### Why Open Source

The Quran belongs to everyone. A study tool for the Quran should not be locked behind proprietary walls. Making The Primer open source means:

- **Access is never gated.** Anyone can read, study, and build knowledge around the Quran for free, forever. The core experience — reading, study panels, notes, bookmarks, mind maps, AI integration — is open source.
- **The community can contribute.** Translations, tafsir integrations, accessibility improvements, language support, new panel types, themes, bug fixes. The data layer is particularly suited for community contributions since it's structured text.
- **Trust through transparency.** Users can verify that the Quranic text is authentic, that AI responses are validated, that their data is handled correctly. No black boxes.
- **Longevity.** If the maintainers disappear, the project lives on. A proprietary Quran app dies with its company. An open source one belongs to the ummah.

This aligns with the Islamic tradition of making knowledge freely accessible — sadaqah jariyah in code form.

### The Three Tiers

The same codebase powers all three tiers. The only difference is where user data lives.

| Tier | Who it's for | Quran data | User data (notes, bookmarks, progress) | Cost |
|------|-------------|------------|----------------------------------------|------|
| **Self-hosted** | Developers, tinkerers, privacy maximalists | Bundled locally | Local only (their machine, their responsibility) | Free forever |
| **Free app** | Everyone else | Bundled locally | Local (browser storage), with full export/import | Free forever |
| **Cloud sync** | Users who want multi-device sync and backup | Bundled locally + cloud backup | Synced across devices, backed up, conflict resolution | Subscription |

**The Quran text, translations, tafsir, and study content are always free and always local.** Nobody pays to read the Quran. The paid tier is for cloud infrastructure — sync servers, backup storage, bandwidth.

This is the Obsidian/GitLab/Cal.com model: **open core, paid cloud.**

### Why This Works for a Quran App

1. **The Quran text is immutable.** Translations and tafsir change rarely. This is the perfect use case for bundling everything locally. The entire Arabic text + dozens of translations + tafsirs fit in a few megabytes. There is no "freshness" problem — unlike a news app or social feed, the data doesn't go stale.

2. **Notes are sacred to the user.** Years of personal study notes, bookmarks, mind maps, and AI conversations are irreplaceable. Users must own their data. Local-first with full export guarantees this.

3. **No lock-in builds trust.** Full import/export in open formats (JSON, Markdown) means users can leave anytime. They can move their study data to Obsidian, another app, or a printed journal. Paradoxically, this freedom is what makes them stay.

4. **Subscription funds development without gating access.** The free tier is genuinely complete — not a crippled demo. Cloud sync is a real service with real infrastructure costs. Users who can pay, pay. Users who can't, still get the full study experience.

### Import / Export

User data is never trapped:

- **Export notes** → Markdown (for Obsidian, personal archive) or JSON (for programmatic use)
- **Export bookmarks** → JSON with verse text in selected translations
- **Export mind maps** → Image (PNG/SVG) or structured JSON
- **Export everything** → Full JSON archive of all user data (notes, bookmarks, progress, preferences, AI conversations)
- **Import** → Same formats. Bring your study data from another tool or from a backup.

In the future, users could share curated study collections — a set of notes and bookmarks on "Stories of the Prophets" that another user can import into their own knowledge base.

---

## Distribution & Platform Strategy

### The Thought Process

The goal is: **one codebase, every platform, cheapest path to users first.**

Desktop apps don't require separate codebases per OS anymore. Technologies like Tauri v2 and Electron compile a single web frontend into native apps for Mac, Windows, and Linux. React Native / Capacitor do the same for mobile. But these are wrappers — they all start with a web app.

The web is the universal runtime. Every device has a browser. A URL is the most frictionless distribution possible — no app store approval, no download, no installation. Quran.com, Notion, Figma, and Linear all prove that web apps can be world-class products.

So the strategy is: **ship the web app first, layer native capabilities as needed.**

### Distribution Phases

**Phase A — Web App (first)**

Deploy the Next.js app to Vercel (free tier). Anyone with a browser on any device opens the URL and starts reading. Quran text is cached aggressively by the browser. User data lives in IndexedDB (the browser's built-in local database) for offline capability.

- Cost: $0
- Reach: Every device with a browser
- Offline: Yes (Service Worker + cached data + IndexedDB)
- Time to user: Instant (open a URL)

**Phase B — PWA (trivial addition)**

Add a Service Worker and manifest.json to the existing web app (~30 minutes of work). Now it's installable on home screens and docks, works fully offline, and feels native. Still one codebase, still free hosting.

- Android: "Add to Home Screen" from Chrome — full PWA support
- iOS: "Add to Home Screen" from Safari — good PWA support (some limitations on background audio, push notifications)
- Mac/Windows/Linux: Installable via Chrome/Edge — desktop PWA with its own window

**Phase C — Native Apps (only if PWA hits limitations)**

Wrap the same web frontend in **Tauri v2** for native desktop + mobile apps. Same React/TypeScript/Tailwind code. Tauri uses the OS's built-in webview (not a bundled browser), so binaries are tiny (~3-10MB vs Electron's ~150MB). Tauri is free and open source.

Native wrappers would only be needed for:
- Background audio that doesn't cut out when the browser tab loses focus
- Push notifications on iOS (where PWA push support is limited)
- App store distribution (some users only discover apps through stores)
- Larger local databases via native SQLite (if IndexedDB limits are hit)

This may never be needed. The PWA may be sufficient forever.

### Local Storage Strategy

The data splits naturally into two categories with different storage needs:

**Quranic content (read-only, shared, immutable):**
- Arabic text, translations, tafsir, morphology, audio metadata
- Bundled as static JSON, cached by the Service Worker
- ~5-15MB compressed for the core dataset (Arabic + popular translations + tafsirs)
- Additional translations/tafsirs fetched on demand and cached
- Identical for every user — no sync needed

**User data (read-write, personal, mutable):**
- Notes, bookmarks, reading progress, preferences, AI conversations, mind maps
- Stored in IndexedDB (via Dexie.js) for the web/PWA version
- Stored in SQLite for native app versions (Tauri/Capacitor)
- Unique per user — this is what cloud sync handles

**Cloud tier (PostgreSQL):**
- Postgres for the sync backend — relational joins, pgvector for embeddings, ACID transactions
- Receives user data from IndexedDB/SQLite, resolves conflicts, serves to other devices
- Also hosts the full Quranic content database for API access

The repository layer uses the same interfaces regardless of storage backend — `NotesRepository.findByVerse()` works whether it's hitting IndexedDB, SQLite, or Postgres. Dependency injection swaps the implementation per platform.

---

## External Resources

| Resource | Purpose | Status |
|----------|---------|--------|
| QuranHub (misraj-ai) | PostgreSQL dump: 430+ editions, 156 tafsirs, morphology, audio metadata | Primary data source |
| Quran.com API v4 | Translations, tafsir, audio, word-by-word | Active — for supplementary/dynamic content |
| fawazahmed0/quran-api | 440+ translations in 90+ languages (public domain) | For translation breadth |
| spa5k/tafsir_api | 27 tafsirs in 6 languages (MIT) | For additional tafsir coverage |
| Quranic Arabic Corpus | Word morphology, syntax trees, semantic ontology | For word-by-word analysis |
| islamAndAi/QURAN-NLP | 700K+ hadiths, narrators, morphology (Apache 2.0) | For hadith cross-references |
| quran-validator (GitHub) | LLM output validation — ensures AI never misquotes Quran | Needed for LLM features |
| Sunnah.com API | Verified hadith with isnad chains | Needs API key |
| YouTube Data API v3 | Video lectures, animations | Needs API key |
| Whisper / Deepgram | Voice note transcription | To evaluate |
| OpenAI / Anthropic APIs | LLM intelligence layer | To integrate |

See [RESEARCH.md](./RESEARCH.md) for detailed evaluation of all data sources, schemas, licenses, and the data import strategy.

---

## Design Principles

1. **Peace first.** The reading experience is sacred. No clutter, no distractions, no dark patterns. Beautiful Arabic typography, calm colors, smooth transitions.

2. **One screen, infinite depth.** Everything is visually contained in a single screen. You go deeper and deeper — tafsir, then a hadith chain, then a cross-reference in Genesis, then a lecture — but you never leave. The surface is always one gesture away. No page navigation, no "back button anxiety." Layers open over or beside each other, and collapse when you're done. You are always *here*, just at different depths.

3. **Depth without disorientation.** The breadcrumb trail never breaks. Every layer knows where it came from. A persistent breadcrumb or depth indicator shows you exactly where you are in the stack: Verse → Tafsir → Hadith → Cross-Reference. One tap collapses everything back to the verse. The reading position is never lost.

4. **Your knowledge grows.** Every note, every bookmark, every reading session builds your personal understanding. The app connects your past learning to your current reading. Over time, it becomes a reflection of your unique journey with the Quran.

5. **AI serves the text.** LLMs help you understand, explore, and connect — but the Quran is the source of truth. Every AI-generated Quranic reference is validated. The AI is a tool, not an authority.

6. **You control the voices.** Choose which scholars, which translations, which interpretations surface. Your trust graph is yours. The app never pushes an agenda.

7. **Offline-capable.** Core Arabic text and selected translations work without internet. Your notes and bookmarks sync when connected but are always available locally.

---

## UI Model: One Screen, Infinite Depth

The entire experience lives within a single visual container. There are no page transitions for study content. Instead, the interface uses **layered panels** that slide, stack, and collapse — creating a sense of going deeper without ever leaving the page.

### The Surface

The default state: Quran text with your chosen translations, filling the screen. Peaceful, uncluttered. The verse you're reading is the anchor.

### Going Deeper

Tap a verse, and a **context panel** slides open from the right (or bottom on mobile). This is the first layer — it might show tafsir, hadith summaries, or quick actions. From within that panel, you can drill further: open a specific tafsir commentary, follow a hadith chain, view a cross-scripture reference. Each deeper layer opens *within* the panel system, pushing the previous layer back or stacking beside it.

```
Surface          Layer 1           Layer 2              Layer 3
┌──────────┐  ┌──────────┐     ┌──────────┐        ┌──────────┐
│          │  │    │     │     │   │      │        │  │       │
│  Quran   │  │ Q  │Tafsir│    │ Q │ Hadith│       │Q │ Cross │
│  Text    │→ │ u  │Panel │ →  │ u │Detail │  →    │u │ Ref   │
│          │  │ r  │      │     │ r │      │        │r │ Detail│
│          │  │ a  │      │     │ a │      │        │a │       │
│          │  │ n  │      │     │ n │      │        │n │       │
└──────────┘  └──────────┘     └──────────┘        └──────────┘
                                                     ↑
                                              Breadcrumb: Verse 2:54 → Tafsir → Hadith → Torah ref
```

### The Breadcrumb Stack

A persistent, minimal breadcrumb bar shows your depth:

**Al-Baqarah 2:54** → Tafsir (Ibn Kathir) → Hadith (Bukhari 3456) → Cross-ref (Exodus 32:20)

Each segment is tappable — jump back to any level instantly. The × button collapses everything back to the surface. The Quran text is always visible (even if compressed to a narrow column), so you never lose your place.

### Panel Behaviors

- **Desktop:** Side panels split the screen. The Quran text compresses but remains visible. Multiple panels can tile.
- **Mobile:** Panels slide up as sheets (like iOS). Swipe down to dismiss. The verse you're studying peeks at the top.
- **Keyboard:** Escape closes the topmost layer. Shift+Escape closes all layers back to the surface.
- **Transitions:** Smooth, calm animations. Panels don't jump or flash — they slide, fade, and settle.

### What This Means in Practice

A user reading Surah Al-Baqarah 2:65 (the story of the Sabbath-breakers turned to apes):
1. **Surface:** Reading the Arabic with Sahih International translation
2. **Layer 1:** Taps the verse → context panel opens with tafsir summary, related hadith count, "Cross-references available" indicator
3. **Layer 2:** Opens Ibn Kathir's tafsir → reads the full commentary, which mentions a related hadith
4. **Layer 3:** Follows the hadith link → reads the full hadith with chain and grading
5. **Layer 3 (swap):** Goes back one, then opens "Cross-scripture" → sees how the Torah (Exodus, Numbers) records the Sabbath-breaking story and how Babylonian records reference it
6. **Notes:** At any depth, taps "Add to notes" → the current content (a tafsir excerpt, a hadith, a cross-reference) is clipped into their personal notes, automatically linked to verse 2:65
7. **Surface:** Taps × or the verse breadcrumb → everything collapses. They're back at 2:65, exactly where they were, and they continue reading 2:66.

At no point did they leave the page. At no point did they lose their reading position. The depth was infinite, but the surface was always one tap away.

---

## Phased Roadmap

### Phase 0-3: Foundation (DONE)
Next.js app with Arabic text, basic reading, audio, bookmarks, notes, progress tracking, tafsir, hadith stubs, search.

### Phase 4: Local-First Data Layer + Offline Reading
- Bundle Quranic content as static JSON (Arabic text, translations, tafsir) cached by Service Worker
- Set up IndexedDB (via Dexie.js) for user data: notes, bookmarks, reading progress, preferences
- Import QuranHub data (translations, tafsirs, morphology) into the bundled dataset
- Multi-translation simultaneous display
- Full offline reading capability
- Export/import for all user data (JSON, Markdown)

### Phase 5: Study Panels + Knowledge Building
- Passage-range bookmarks
- Rich note editor with embedded references and clipping
- Theme tagging across verses
- Cross-referencing engine (as you read, surface related content)
- Personal note cross-referencing ("you wrote about this before")
- Reading journey tracking (themes explored over time)
- PWA support (Service Worker, manifest, installable)

### Phase 6: Knowledge Graph + Mind Maps
- Mind map generation from notes, bookmarks, and themes (interactive, zoomable graph visualization)
- Visual knowledge graph that grows with the user's study
- Theme-based navigation and discovery

### Phase 7: Cloud Sync Tier
- PostgreSQL backend for sync service
- IndexedDB ↔ Postgres sync protocol
- Conflict resolution (timestamp-based with merge option)
- Multi-device reading position handoff
- Backup and restore
- Subscription billing

### Phase 8: LLM Integration
- Contextual Q&A tied to current reading position
- Semantic search via embeddings (pgvector on cloud tier)
- quran-validator integration for all AI output
- AI-powered theme discovery and connection suggestions
- Voice notes with transcription

### Phase 9: Cross-Scripture + Historical Context
- Torah, Bible, historical record cross-references
- Asbab al-Nuzul (circumstances of revelation) database
- Timeline view (revelation order, historical events)

### Phase 10: Multimedia + Scholar Graph
- Video/lecture linking to verses and themes
- Scholar trust preferences (show more of Y, hide X)
- Curated content recommendations shaped by your preferences

### Phase 11: Native Apps (if needed)
- Tauri v2 wrappers for Mac, Windows, Linux, iOS, Android
- Native SQLite for larger local datasets
- Background audio, push notifications, app store distribution
- Same codebase, native shell

### Phase 12: The Primer
- Everything connected. Reading, studying, noting, asking, exploring — one seamless experience
- Your personal knowledge base reflects years of study
- The app knows your journey and gently surfaces what you haven't explored yet
- Open source community thriving — contributors adding translations, tafsirs, features
- Users sharing curated study collections with each other

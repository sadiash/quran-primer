# UX Design Brief — The Primer

*The definitive UX specification. Describes how the experience should feel and behave, not how it should look. Every section focuses on what the user is trying to do, what they expect to happen, and how the system responds.*

---

## Executive Summary: The Four Flows

The entire experience distills into four user flows:

1. **Immersive Reading** — The "surface." Users read in a distraction-free environment with customizable layouts. Arabic is optional. One translation or five, any language. State preservation ensures they return to the exact verse and scroll position where they left off.

2. **Deep Study (Layered Exploration)** — Users drill down into layers of knowledge (Tafsir, Hadith, Cross-scripture) without leaving the screen. A panel-based system where each discovery opens as a layer, supported by a persistent breadcrumb trail.

3. **Personal Knowledge Building** — Capturing insights. Rich bookmarks (single verses to thematic threads), rich notes (text, voice-transcribed, clipped excerpts), all automatically linked to source text and interconnected.

4. **Visual Knowledge Mapping** — Interactive mind maps generated from notes, bookmarks, or themes. The user's learning journey visualized as a zoomable, navigable graph.

---

## The Core Mental Model: VS Code for the Quran

The user is sitting in front of a **workspace**. The central editor is the Quran text. Around it: panels that can be toggled on, off, resized, rearranged. An activity bar on the side to switch contexts. A command palette to find anything. A breadcrumb bar to know where you are. A bottom panel for audio or AI chat.

This is **VS Code applied to sacred study.**

The crucial insight: the app is not a simple reading app that hides complexity. It is a **power tool that defaults to simplicity.** A new user sees clean text. A power user sees a dense, information-rich workspace with six panels open. Both are using the same app — the difference is which toggles are on.

**Everything is a toggle.** Arabic text: toggle. Translation 1, 2, 3: toggle. Tafsir panel: toggle. Hadith panel: toggle. Notes sidebar: toggle. Audio dock: toggle. Breadcrumb bar: toggle. Line numbers (verse numbers): toggle. Minimap (surah progress): toggle. The user assembles their own workspace from available components.

Think of it as:
- **Editor area** → the Quran text (translations, Arabic, whatever combination)
- **Activity bar** → thin icon rail to toggle major panels (study, knowledge, search, AI, settings)
- **Side panel(s)** → tafsir, hadith, cross-references, notes, bookmarks — any combination, split or tabbed
- **Bottom panel** → audio dock, AI conversation, search results
- **Command palette** → universal search (Cmd/Ctrl+K), jump to verse, switch surah, toggle anything
- **Zen mode** → strip everything away, just the text, full screen, pure reading

The metaphor of depth still applies within this model. Panels themselves have depth (tafsir panel → specific scholar → referenced hadith). The breadcrumb tracks it. But the overall layout is a **customizable workspace**, not a single-track drill-down.

---

## Critical Design Axiom: Arabic Is Not Mandatory

Most Quran apps assume Arabic is the primary text and translations are secondary. **This app makes no such assumption.**

A user may:
- Read Arabic only (classical student)
- Read Arabic + one translation (most common Quran app behavior)
- Read three translations in English, no Arabic (a convert exploring the Quran for the first time)
- Read one English + one Urdu + one Turkish translation simultaneously (multilingual learner)
- Read Arabic + one English + one Urdu (heritage speaker comparing nuance)

**Arabic is a toggle, not a given.** It starts enabled by default (with one translation), but the user can turn it off at any time. When Arabic is off, the selected translations become the primary text. The layout, typography, and verse structure all adapt — translations are not second-class citizens shown in small font below the "real" text. If the user has chosen Sahih International as their only visible text, it should fill the reading surface with the same dignity and readability as Arabic would.

**Implications:**
- The reading surface layout must work beautifully with any combination: Arabic only, translation only, Arabic + 1, Arabic + 3, 3 translations no Arabic, etc.
- Font size controls are per-layer: Arabic font size, Translation 1 font size, Translation 2 font size — or a global "text size" that scales proportionally
- The verse is the atomic unit regardless of which text layers are visible. Verse numbers, bookmarks, notes, study actions all attach to the verse, not to any specific text rendering
- When Arabic is off, audio recitation still works — the user hears Arabic while reading the translation. The verse highlight syncs to the translation text
- Search works across all visible text layers

---

## Critical Design Axiom: Compact Density

The reading surface must use screen real estate aggressively. The goal is to show as much text as possible while remaining readable. Think "book page, not app screen."

**Rules:**
- **Minimal chrome by default.** The top bar, navigation rail, and audio dock are the only persistent elements — and each is toggleable. When all chrome is hidden (Zen mode), the text goes edge-to-edge.
- **Compact verse layout.** Verses flow as continuous prose within a surah, not as individually carded items with padding and borders between them. A verse ending and the next verse beginning should feel like reading a paragraph, not scrolling through a list of cards.
- **Density presets:**
  - **Comfortable** — generous line height, clear verse separation, visible verse numbers. For casual reading on large screens.
  - **Compact** — tighter line height, inline verse markers, maximum text per screen. For deep reading sessions where you want to see the full passage.
  - **Dense** — minimal spacing, small verse indicators, maximum information. For the researcher with multiple panels open who needs the reading surface to take as little space as possible.
- **Verses per screen matters.** On a typical desktop with compact density, the user should see 15-20 verses at once (single translation). On mobile, 8-12. If the user is seeing only 3-4 verses, the density is wrong.
- **Multi-translation compact layout.** When showing 3 translations, the challenge is density. Options:
  - **Interleaved:** Arabic, then Translation 1, then Translation 2, then Translation 3 — then next verse. Compact but vertical.
  - **Columnar:** Side-by-side columns (desktop only). Each column is one text layer. Very dense, great for comparison.
  - **Tabbed per verse:** Show one translation at a time per verse, swipe or tab to switch. Maximum density, minimum comparison.
  - **The user chooses.** These are layout toggles.

---

## Critical Design Axiom: Everything Is a Toggle

Inspired by VS Code's toggle-everything philosophy. The user controls exactly what is visible.

**Reading surface toggles:**
| Toggle | Default | What it controls |
|---|---|---|
| Arabic text | On | Show/hide the Arabic Quranic text |
| Translation 1 | On (Sahih International) | Show/hide first translation |
| Translation 2 | Off | Show/hide second translation |
| Translation 3 | Off | Show/hide third translation |
| Verse numbers | On | Show/hide verse markers |
| Surah headers | On | Show/hide surah name bars between surahs |
| Bismillah | On | Show/hide Bismillah between surahs |
| Word-by-word | Off | Show/hide word-by-word translation under Arabic |

**Workspace toggles:**
| Toggle | Default | What it controls |
|---|---|---|
| Activity bar | On | The thin icon rail on the left |
| Top bar | On | Surah name, search, settings |
| Audio dock | Off (appears on play) | Bottom audio player |
| Breadcrumb bar | Off (appears on study) | Depth navigation trail |
| Side panel | Off | Tafsir / hadith / notes / etc. |
| Bottom panel | Off | AI chat / search results |
| Minimap | Off | Visual surah progress indicator |

**How toggles are accessed:**
- **Command palette (Cmd/Ctrl+K):** Type "toggle arabic" or "toggle tafsir panel" — fastest method
- **Activity bar icons:** Click to toggle their associated panel
- **Right-click context menu:** On the reading surface, right-click → toggle options
- **Settings page:** Full list of all toggles with their current state
- **Keyboard shortcuts:** Power users bind their own (e.g., Ctrl+Shift+T for tafsir panel)

**Toggle state is persistent.** The user's toggle configuration is saved and restored on every session. They can also save named workspace presets:
- "Daily Reading" — Arabic + one translation, no panels, compact density, Zen mode
- "Deep Study" — Arabic + two translations, tafsir panel open, notes panel open, comfortable density
- "Translation Comparison" — Arabic off, three translations in columnar layout, dense mode

---

## Users

### Primary: The Devoted Learner

Reads the Quran regularly (daily or weekly) and wants to understand it deeply. Not a scholar. May or may not read Arabic fluently. Has strong opinions about which scholars they trust. Takes notes — sometimes at 2am on their phone, sometimes at a desk with time to study. Accumulates knowledge over months and years. Gets frustrated when apps make them lose their place, when study tools feel clinical, or when they can't find the note they wrote three weeks ago.

### Secondary: The Curious Learner

New to the Quran or returning after a long time. May not read Arabic at all. Wants a guided, contextual learning experience. Needs the app to be immediately useful with translations only — no assumption that they know Arabic, no assumption about their background. The app should make them feel welcome, not inadequate. This user benefits most from the "Arabic is a toggle" principle.

### Tertiary: The Researcher

Doing comparative study — cross-referencing scriptures, tracing themes across the entire Quran, building structured notes for a talk or paper. They push the knowledge features hard: mind maps, theme cross-referencing, multi-translation comparison, export. They want maximum information density and multiple panels open simultaneously. This user benefits most from the VS Code workspace model.

---

## Information Architecture

```
Home (your workspace — where you left off, exactly as you left it)
│
├── The Quran (reading + study — 90% of the experience)
│   ├── Surah browser (find what to read — opens as overlay/palette)
│   ├── Reading surface (the editor — text layers, verse by verse)
│   └── Study panels (toggled on/off, docked to sides or bottom)
│       ├── Translations panel (manage active translations)
│       ├── Tafsir panel (commentary from various scholars)
│       ├── Hadith panel (related narrations)
│       ├── Historical context panel (Asbab al-Nuzul, timeline)
│       ├── Cross-scripture panel (Torah, Bible, historical records)
│       ├── Media panel (lectures, videos, animations)
│       └── AI panel (contextual Q&A)
│
├── Your Knowledge (everything you've built)
│   ├── Notes (searchable, linked, tagged)
│   ├── Bookmarks (verses, passages, themes)
│   ├── Mind maps (visual knowledge graphs)
│   └── Reading journey (progress, patterns, history)
│
├── Command Palette (find anything — verses, notes, themes, commands, toggles)
│
└── Preferences (workspace configuration, scholar trust, display, audio)
```

### Two Modes, One Screen

1. **Reading mode** — The surface. Text fills the workspace. Panels are closed. Calm.
2. **Study mode** — Panels are open. The text compresses but remains visible. Information-rich.

These are not separate pages. They are states of the same workspace. The transition is toggling panels open. The user doesn't "switch to study mode" — they open a panel and they're studying. Close it and they're reading again.

---

## Core User Journeys

### Journey 1: Daily Reading

**Context:** After Fajr prayer. 15 minutes.

1. **App opens to their workspace, exactly as they left it.** No home screen, no dashboard. The reading surface at the last verse they read. If panels were open, those are restored too (or not, based on their "resume panels" preference — a toggle).

2. **They read.** The text fills the screen. Their chosen text layers (maybe Arabic + Sahih International, maybe just Sahih International) flow as continuous prose. Compact density. They see 15 verses at a glance on desktop, 10 on mobile.

3. **A verse strikes them.** Long-press → minimal action bar appears adjacent to the verse. Bookmark. Note. Study. Audio. Does not cover the verse.

4. **They bookmark it.** One tap. Subtle confirmation — a thin marker appears on the verse's edge. No modal. No dialog. **Reading flow is never broken for organizational tasks.**

5. **They close the app. Tomorrow, they're at the exact verse they stopped at.** Same scroll position, same text layers, same density setting.

**UX requirements:**
- The app must remember scroll position, not just "last surah visited"
- Bookmarking is a single-tap, zero-friction action
- Default state on open: the reading surface, not a dashboard
- First-time users need onboarding; returning users go straight to their workspace
- Visual indicators for bookmarked/noted verses must be present but not disruptive to density

---

### Journey 2: Deep Study Session

**Context:** Saturday afternoon. One hour. Reading Surah Al-Baqarah, verse 2:65.

1. **They tap the verse.** A context panel slides open (right side on desktop, bottom sheet on mobile). This is the **preview layer** — a table of contents for the depth below:
   - Tafsir summary (2-3 sentences). "Read full →"
   - "3 related hadith →"
   - "Cross-references: Torah (Exodus 31), Talmud →"
   - "Your notes (2) →" (if they have existing notes)
   - Quick actions: bookmark, note, audio, AI

   This loads fast — it's metadata and counts, not full content.

2. **They tap "Full Tafsir."** The panel transitions to the tafsir view. Scholar selector at top: Ibn Kathir, Al-Jalalayn, Al-Tabari (ordered by their trust preferences). They select Ibn Kathir. The full commentary fills the panel. Breadcrumb: **2:65 → Tafsir → Ibn Kathir**.

3. **Within the tafsir, a hadith is referenced.** It's an interactive link. They tap it. The panel navigates deeper — hadith detail view with full text, isnad (chain), grading. Breadcrumb: **2:65 → Tafsir (Ibn Kathir) → Hadith (Bukhari 3456)**.

4. **They want cross-references.** They tap the breadcrumb "2:65" to jump back to the preview. Tap "Cross-references." The panel swaps to cross-scripture content (this is a **swap at the same depth**, not a new layer). They see Exodus 31:14-15, Numbers 15:32-36, Babylonian Talmud references. They tap Exodus. The panel goes deeper. Breadcrumb: **2:65 → Cross-ref → Exodus 31:14-15**.

5. **They want to capture an insight.** At this depth, they tap "Add to notes." A note composer appears, pre-filled with context: "Note on 2:65, via Cross-ref: Exodus 31:14-15." They type their thought. They tap "Clip this passage" to embed the Exodus text into their note with automatic source attribution.

6. **Done studying.** Tap × or the verse reference in the breadcrumb. All layers collapse. They're back at 2:65 on the reading surface. They scroll to 2:66 and keep reading.

**Alternative: multi-panel study (VS Code split).** On desktop, instead of a single panel navigating through depth, the user could have **multiple panels open simultaneously:** tafsir on the right, hadith on the bottom, notes in a narrow side strip. Each panel is independently navigable. This is the "split editor" model. The user can also **pop a panel into a tab** and switch between study contexts.

**UX requirements:**
- The preview layer must load instantly (metadata only)
- Content panels can take a moment but must show skeleton loading (no layout shift)
- Breadcrumb is always visible and interactive during study
- Swapping content at the same depth level feels like a transition, not opening a new panel
- The note composer knows its context automatically (verse, depth, source)
- Collapsing all layers is a single action. Reading position has not moved.
- Desktop supports simultaneous panels. Mobile does not (sequential depth only).

---

### Journey 3: Finding Something You Studied Before

**Context:** The user wrote a note about patience three weeks ago while reading Surah Yusuf.

1. **They hit Cmd/Ctrl+K.** The command palette opens — universal search. They type "patience."

2. **Results appear instantly, grouped by type:**
   - **Your notes (2):** "Note on 12:18 — beautiful patience (sabr jameel)..." / "Note on 2:153 — seek help through patience..."
   - **Verses (14):** Verses containing "patience" or "sabr"
   - **Bookmarks (3):** Passages bookmarked on this topic
   - **Themes (1):** "Patience (Sabr)" — a recognized theme linking multiple verses

3. **They tap the note.** It opens with its linked verse (12:18), the tafsir excerpt they clipped, the tags. They tap the verse reference to jump to 12:18 on the reading surface.

4. **They tap the theme.** A thematic view opens — every verse tagged with "Patience," their notes on those verses, their bookmarks, a mini mind map of the theme.

**UX requirements:**
- The command palette is the fastest path to anything: verses, notes, commands, toggles
- Search spans all content types simultaneously
- Results are grouped but not siloed
- Notes carry enough context preview to identify without opening each one
- Navigation from search preserves the position they'll return to

---

### Journey 4: Voice Note on Mobile

**Context:** Late night, phone in bed. A thought about the verse they just read.

1. **Long-press the verse.** Action bar. Tap microphone.

2. **Voice recorder activates.** Minimal: waveform, stop button, verse reference shown. They speak for 30 seconds.

3. **They stop.** Audio saves immediately. "Transcribing..." appears. Transcription populates within seconds. They can edit or leave it.

4. **The note is saved.** Linked to the verse, searchable by transcribed text, visible as a voice-note indicator on the verse.

5. **Later at their desk,** they find it via search keyword. They can play the audio, read the transcript, add typed notes on top, clip tafsir excerpts in — building on the midnight thought.

**UX requirements:**
- Voice recording is a first-class note method, not an afterthought
- Audio saves immediately — never gated on transcription
- Transcription is async; the note exists before transcription finishes
- Voice + typed content coexist in the same note
- Mobile accommodates one-handed, low-light usage

---

### Journey 5: Building a Mind Map

**Context:** Two months of study. 40+ notes, 25+ bookmarks, 15 surahs read. They want to see how "Stories of the Prophets" connects.

1. **They open the knowledge view.** Select "Mind Map." Generation options:
   - From a specific verse (everything connected to it)
   - From a tag/theme (everything saved under that theme)
   - From a bookmark collection (relationships between bookmarked items)
   - From all knowledge (the full graph, clustered)

2. **They choose "Prophets."** A mind map generates. Center: the theme. Radiating outward: verse nodes (labeled by surah:verse), note nodes (first line preview), tafsir clips, connections between notes that reference the same verses.

3. **They interact.** Tap a node → preview. Double-tap → open full content (in a panel, consistent with workspace model). Pinch to zoom. Drag to pan. **Every node is a portal.**

4. **They notice a cluster.** Three notes about Prophet Musa, connected through Al-Baqarah, Al-A'raf, and Ta-Ha. They didn't see the connection before. **Making the invisible structure of their learning visible.**

5. **They tap a connection line.** It shows why: same theme tag, same prophet mentioned, or user linked via a note that references both.

**UX requirements:**
- Mind maps are generated dynamically, not manually built
- Interactive and navigable, not a static image
- Nodes identifiable at a glance (type icon + brief label)
- Opens as a panel/layer within the workspace model
- Performance: 50+ nodes must remain responsive
- Intelligent clustering (by surah, theme, time)
- Empty states are encouraging, not sad

---

### Journey 6: Translation-Only Multi-Language Reading

**Context:** A new Muslim who doesn't read Arabic. They want to compare how English translators render the same verse, and also see an Urdu translation their teacher recommended.

1. **They open preferences (or command palette: "toggle arabic").** They turn Arabic off. They enable three translations: Sahih International (English), Yusuf Ali (English), Fateh Muhammad Jalandhry (Urdu).

2. **The reading surface adapts.** Three text layers per verse. No Arabic. The translations are the primary text — full-sized, well-typeset, not subordinate to missing Arabic. Verse numbers are shown in standard numerals.

3. **They choose a layout.** Via command palette or settings:
   - **Stacked:** Translations appear one below the other per verse. Easiest to read, uses vertical space.
   - **Columnar:** Three columns side by side (desktop). Dense, great for comparison. Each column is one translation.
   - **Focused + tabs:** One translation visible per verse, tabs to switch (Sahih | Yusuf Ali | Jalandhry). Most compact. Best for mobile.

4. **They read.** They notice Sahih International says "those who believe in the unseen" while Yusuf Ali says "those who believe in the Unseen" (capitalized — implying a specific concept). They long-press that phrase and ask the AI: "Why do translators differ on capitalizing 'unseen' here?"

5. **They save this as a preset:** "My Study Set." Next time they open the app, it's exactly this configuration.

**UX requirements:**
- Arabic is a toggle, not a fixture. The reading surface must be beautiful and functional without it.
- Translations are not subordinate text — when Arabic is off, they become the primary text and are rendered at full dignity
- Multiple translations in multiple languages must coexist naturally
- Layout options (stacked, columnar, focused+tabs) accommodate different comparison needs and screen sizes
- Translation selection is accessible from the reading surface (not buried in settings)
- Translation presets are saveable and restorable

---

### Journey 7: The LLM Conversation

**Context:** Verse 4:34 — a frequently discussed verse. The user wants scholarly context.

1. **They toggle the AI panel open** (activity bar icon, or Cmd+K → "toggle ai"). It docks to the bottom (like VS Code's terminal). The AI knows context: current verse, visible translations, available tafsir.

2. **They ask:** "What is the range of scholarly interpretation on this verse?"

3. **The AI responds** — structured, sourced. Quranic quotes are verified (quran-validator). Scholarly attributions are linked. They can tap any verse reference or scholar name to open it in a study panel.

4. **Follow-up:** "What does 'daraba' mean in classical Arabic?" AI provides linguistic analysis. They select a portion and tap "Save to notes" — clipped to their notes linked to verse 4:34.

5. **The conversation persists.** If they open the AI panel on this verse tomorrow, their conversation is there. They can continue or start a new thread.

**UX requirements:**
- The AI panel is a workspace panel like any other — dockable to bottom or side, resizable, toggleable
- AI knows the user's current context (verse, translations, study depth)
- Quranic text in AI responses is visually distinct and verifiably linked
- Save AI responses (or portions) to notes
- Conversations are verse-tied and persistent across sessions
- AI never feels authoritative about faith — it presents scholarship
- Streaming responses (word by word), not blocking spinners

---

### Journey 8: Returning After Months Away

**Context:** Four-month gap. They open the app.

1. **Their workspace is exactly as they left it.** Surah Al-Kahf, verse 60. Same panels, same configuration. No "You haven't read in 120 days!" No streak counter. Just the text, waiting.

2. **Their knowledge view has everything.** Notes, bookmarks, mind maps, reading history — all preserved. The history shows the gap non-judgmentally: just dates and surahs.

3. **Ambient context (if they look for it):** "Last session: Story of Musa, Al-Kahf. You also have notes on this story from Al-A'raf and Ta-Ha." Available in the command palette or a gentle indicator, not pushed.

**UX requirements:**
- Never shame, guilt, or gamify. No streaks, no "come back" notifications
- Progress tracking is reflective, not motivational
- Welcoming after any length of absence
- All user data preserved indefinitely

---

### Journey 9: First-Time Experience

**Context:** A user downloads the app for the first time. They may or may not read Arabic.

1. **Brief onboarding (3 steps maximum):**
   - "Do you read Arabic?" → Yes / No / A little. This sets the default: Arabic on or off, and suggests a translation in their language.
   - "Pick a translation" → Show popular translations in detected language. Allow selecting multiple. The user can always change later.
   - "Where would you like to start?" → Surah Al-Fatiha (beginning) / Surah Al-Baqarah (continue from Fatiha) / Browse surahs / Jump to a verse I know.

2. **They land on the reading surface.** Clean, calm, just the text. No feature tour, no tooltips covering everything, no "did you know you can..." popovers.

3. **Discovery is progressive.** They discover features as they need them:
   - They tap a verse for the first time → a one-time subtle hint: "Tap any verse to explore tafsir, hadith, and more."
   - They long-press for the first time → the action bar appears with a one-time hint: "Bookmark, note, or study any verse."
   - They open the command palette for the first time → a brief "search anything, toggle anything" message.

4. **After the first session, no more hints.** The app trusts the user to explore.

**UX requirements:**
- Onboarding is 3 steps or fewer. No account required to start.
- The language/Arabic question sets intelligent defaults
- No feature tours. Discovery through use.
- One-time contextual hints (once per feature, then gone forever)
- The app is immediately useful from the first verse

---

## Interaction Patterns

### The Workspace Layout

The app is a workspace with distinct regions, each toggleable:

```
┌─────────────────────────────────────────────────────────┐
│ [Top Bar]  Surah name  |  Cmd+K search  |  ≡ settings  │  ← toggleable
├──┬──────────────────────────────────┬───────────────────┤
│  │                                  │                   │
│A │                                  │   Side Panel      │
│c │      Reading Surface             │   (tafsir,        │
│t │      (the editor)                │    hadith,        │
│i │                                  │    notes,         │
│v │   Quran text: Arabic + trans.    │    cross-ref)     │
│i │   or just translations           │                   │
│t │   or just Arabic                 │   ← toggleable    │
│y │                                  │   ← resizable     │
│  │                                  │   ← tabbed        │
│B │                                  │                   │
│a │                                  │                   │
│r │                                  ├───────────────────┤
│  │                                  │  Bottom Panel     │
│← │                                  │  (AI chat, search │
│t  │                                  │   results, audio) │
│o │                                  │  ← toggleable     │
│g │                                  │  ← resizable      │
│g │                                  │                   │
├──┴──────────────────────────────────┴───────────────────┤
│ [Breadcrumb] 2:65 → Tafsir (Ibn Kathir) → Hadith       │  ← auto-shows during study
├─────────────────────────────────────────────────────────┤
│ [Audio Dock]  ▶ Al-Minshawi  2:65  ━━━━━━━━━░░░░  3:42 │  ← shows when playing
└─────────────────────────────────────────────────────────┘
```

**Zen mode (toggle or F11):** Everything disappears except the reading surface. Edge-to-edge text. One tap or Escape to exit.

### The Depth Stack (Within Panels)

Panels themselves have depth. The breadcrumb tracks it.

**Rules:**
1. Tapping a verse opens the context preview in the side panel (or creates it if no panel is open).
2. Drilling into content navigates within the panel. Breadcrumb updates.
3. Each breadcrumb segment is tappable — jump back to any level.
4. × closes the topmost depth. Shift+Escape closes all depth (back to panel root). Closing the panel entirely returns to pure reading surface.
5. Swapping content at the same depth (tafsir → hadith) is a transition, not a new level.
6. Maximum recommended depth: 5. Beyond that, breadcrumb compresses.
7. On desktop: multiple panels can each have their own depth stack independently.

**State preservation:**
- Closing a panel and reopening it restores its last state (scroll position, selected scholar, depth)
- Tapping a different verse resets the panel's depth stack to the new verse's preview
- Panel state is saved across sessions

### Verse Interactions

| Gesture | Result |
|---|---|
| Tap | Open/focus context preview in side panel |
| Long-press | Quick action bar (bookmark, note, audio, share, study, AI) |
| Swipe right (mobile) | Quick bookmark (haptic feedback, no dialog) |
| Hover (desktop) | Subtle highlight + inline action icons appear |
| Double-click (desktop) | Select word → show word-by-word translation/morphology |

**Visual indicators on verses:**
- Bookmarked: thin colored line on the verse's edge
- Has notes: subtle note marker
- Currently playing (audio): gentle background highlight
- Has AI conversation: subtle indicator (only if user has interacted)
- Indicators must not disrupt reading density. Nearly invisible until sought.

### The Command Palette

The single most important interaction shortcut. Cmd/Ctrl+K opens it from anywhere.

**It can:**
- Search verses: "2:255" → jumps to Ayat al-Kursi
- Search content: "patience" → verses, notes, bookmarks, themes
- Toggle features: "toggle arabic", "toggle tafsir panel", "toggle zen mode"
- Switch presets: "workspace: deep study", "workspace: daily reading"
- Navigate: "go to surah al-kahf", "go to last bookmark"
- Run commands: "export notes", "new mind map from theme", "change reciter"

It is fuzzy-matched and learns from usage (frequently used commands rise to the top).

### Audio Behavior

Audio is ambient. It lives in the audio dock at the bottom — a persistent bar like a music player.

**Rules:**
1. Play from a verse → audio plays continuously through subsequent verses
2. Currently playing verse is subtly highlighted on the reading surface
3. Dock shows: reciter, current verse, play/pause, progress bar, stop
4. Audio continues through study panels — the dock persists
5. Changing surahs while playing: audio stops (no auto-play on new surah)
6. Mobile: background audio continues when phone is locked or app is backgrounded
7. The dock is a toggle — hide it if you want, audio still plays

### Note Composition

**Quick capture:** Tap note icon on verse → inline input (one line, save button). 10 words, done. No modal.

**Expanded editor:** Tap "expand" → rich editor opens in a panel. Supports: formatted text, embedded verse references (auto-linked), clipped excerpts (tafsir/hadith/cross-ref with source attribution), external links (YouTube, articles), tags, voice recording.

**Clipping:** While reading study content, select text → "Clip to note." Added to the verse's note with automatic source attribution. If no note exists, one is created.

**Voice:** Record → audio saves immediately → transcription async → appears in note. Both audio player and text visible. Editable transcription. Voice and typed content coexist.

### Bookmarking

**Types:**
1. **Single verse** — one tap, zero friction
2. **Passage range** — tap start verse, then tap end verse (or drag selection)
3. **Surah bookmark** — from the surah header
4. **Thematic bookmark** — verses across surahs grouped under a theme (created from knowledge view)

**Organization:** Label, color, category/tag, notes — all optional at creation time. Add later. Tapping a bookmark navigates to that verse/passage.

---

## Screen-by-Screen Behavior

### The Reading Surface

**This is 80%+ of the user's time.**

**Present:**
- Quran text — whatever combination of Arabic and translations the user has toggled on
- Verse markers (numbers, separator dots, or inline — based on density setting)
- Surah headers between surahs
- Bismillah between surahs (except Al-Tawbah)
- Subtle verse indicators (bookmark, note — nearly invisible until sought)

**Not present (by default):**
- No sidebar (until toggled)
- No panels (until toggled)
- No floating action buttons
- No ads, banners, promotions
- No social features
- No "verse of the day" overlays

**Chrome behavior:**
- Scroll down → top bar auto-hides. Just text.
- Scroll up → top bar slides back in
- The activity bar (thin icon rail, left side) is always visible on desktop but can be toggled off
- On mobile: the top bar is the only chrome. Bottom nav appears on scroll-up or swipe-up from edge

**Navigation between surahs:**
- Continuous scroll through the entire Quran (surah N ends, surah N+1 begins)
- Surah browser via command palette or activity bar: searchable list of 114 surahs (number, Arabic name, English name, translation of name, Meccan/Medinan, verse count)
- "Jump to verse" in command palette: type "2:255" to go directly

### The Context Preview

Opens when the user taps a verse. Appears in the side panel (or bottom sheet on mobile).

**Content — scannable sections, each one line:**
1. **Translations** — brief comparison if multiple are active
2. **Tafsir** — 2-3 sentence summary. "Read full →"
3. **Related Hadith** — count + brief titles. "3 related hadith →"
4. **Historical Context** — one line. "Revealed in Medina, Year 2 AH." "Read more →"
5. **Cross-References** — "Torah (Exodus 31), Talmud. 2 available →"
6. **Your Knowledge** — notes, bookmarks, AI conversations on this verse (only if data exists)
7. **Related Themes** — "Patience, Obedience, Sabbath"
8. **Media** — linked videos/lectures. Count + preview.

**Behavior:**
- Loads fast (metadata and counts only)
- Sections with no data are hidden
- Tapping "→" navigates the panel deeper
- Scrollable if content exceeds viewport

### Study Content Panels

Each follows consistent structure within the panel system:

**Tafsir:** Scholar selector (tabs/dropdown, trust-ordered) → full commentary → inline links to referenced hadith, verses, events → "Clip to notes" on text selection.

**Hadith:** List view (brief text, collection, grading) → tap to expand with full isnad → "Clip to notes."

**Cross-scripture:** Organized by source (Torah, Bible OT/NT, Historical records). Passage text, book/chapter/verse, context. Tone: scholarly, neutral, comparative.

**Historical context:** Asbab al-Nuzul, timeline placement, narrative context.

**Media:** Videos/lectures with title, creator, duration, type. Scholar filter applied. Videos play within the panel (embedded). "Add to notes."

### Knowledge View

Where the user sees everything they've built. This may be a separate view (accessed from activity bar) since it's user-anchored, not verse-anchored. But any item opens the reading surface at the relevant verse.

**Notes:** Chronological default, filterable (surah, verse, tag, date, type). Preview: linked verse, first line, tags, date, type indicator. Search within notes. Bulk actions: tag, delete, export.

**Bookmarks:** Grouped by category or chronological. Visual distinction between types (verse, passage, surah, thematic). Tap to jump to reading surface.

**Mind Maps:** Gallery of saved maps + generate new. Interactive: zoom, pan, tap nodes. Each node opens preview; double-tap opens full content.

**Reading Journey:** Surahs read, verses studied (opened Layer 1+), time spent (weekly/monthly), themes explored. **Reflective, not motivational.** Answers "what have I explored?" not "are you doing enough?"

### Preferences

**Sections:**

1. **Text & Layout:**
   - Toggle Arabic on/off
   - Active translations (select, deselect, reorder, add from library)
   - Layout mode (stacked, columnar, focused+tabs)
   - Arabic font size (live preview)
   - Translation font size (live preview, per-translation or global)
   - Density preset (comfortable, compact, dense)
   - Verse number style (Arabic numerals, standard, hidden)

2. **Workspace:**
   - Default panel layout
   - Saved workspace presets (create, edit, delete)
   - Resume panels on open (toggle)
   - Zen mode keyboard shortcut

3. **Scholar Trust Graph:**
   - List of scholars/commentators
   - Per scholar: show more / neutral / show less / hide completely
   - Affects tafsir ordering, media recommendations, AI responses
   - "Reset to default"

4. **Audio:**
   - Default reciter
   - Playback speed
   - Auto-play behavior (continuous, verse-by-verse with pause)
   - Repeat settings

5. **Display:**
   - Theme (light, dark, system)
   - Animations (on/off — accessibility)
   - Reduced motion

6. **Account:**
   - Sign in / sign out
   - Sync status
   - Data export (notes, bookmarks, progress — JSON, PDF, or Markdown)
   - Data deletion

---

## State Management & Edge Cases

### Empty States

Welcoming, not sad. Instructive, not pitying.

- **No bookmarks:** "Swipe right on any verse to bookmark it." Show a gentle visual hint.
- **No notes:** "Tap the note icon on any verse to start capturing your thoughts."
- **No mind map data:** "Your mind map will grow as you study. Start by reading and noting what stands out."
- **No search results:** "No results for '[query]'. Try different keywords or search in Arabic."
- **No AI conversations:** "Ask anything about this verse — its meaning, its history, how scholars interpret it."
- **No translations selected:** "Choose at least one translation to start reading." (This is the one state that blocks the reading surface.)

### Loading States

- **Reading surface:** Local text loads instantly. API-sourced translations show skeleton shimmer.
- **Context preview:** Section headers appear immediately; counts/summaries populate as they arrive.
- **Study panels:** Panel structure and tabs appear immediately; content shows skeleton. Never a blank panel.
- **AI responses:** Gentle pulsing "Thinking..." indicator. Streaming word-by-word when available.
- **Mind maps:** Nodes appear incrementally with brief animation, not all at once after a blank screen.
- **Translation toggle:** When the user toggles a new translation on, it loads in-place with shimmer. Existing text doesn't shift.

### Error States

- **Offline:** Reading continues (local data). Panels that need API: "You're offline. [Content] needs internet. Your notes and bookmarks are available." No harsh modals.
- **API failure:** "Couldn't load tafsir. Try again?" Retry button. Rest of interface functional.
- **AI error:** "Couldn't answer that. Try rephrasing." Never raw error messages.
- **Transcription failure:** Audio saved. "Transcription unavailable now. Audio saved — we'll transcribe when possible."
- **Sync conflict:** Last-write-wins with visible indicator and option to view both versions.

### Conflict States

- **Note edited on two devices:** Visible conflict indicator, option to view and merge both versions.
- **No account:** Everything works locally. On sign-up, local data syncs to cloud. No data lost.
- **Workspace preset conflict:** If a preset references a translation that's been removed from the library, gracefully degrade (skip that translation, don't break the preset).

---

## Emotional Design Goals

### Should feel like:
- A quiet library with every book you need, and a patient scholar beside you who speaks only when asked
- A journal that remembers everything and never judges
- A personal study room that's always exactly as you left it
- VS Code for someone who loves their craft — powerful, customizable, but never overwhelming because you only see what you've toggled on

### Should NOT feel like:
- Social media (no feeds, likes, sharing prompts, "trending verses")
- A gamified learning app (no streaks, points, leaderboards, achievements)
- A productivity tool (no task lists, "set a reading goal," push notifications nagging you)
- A news app (no "verse of the day" forced on you, no editorial content)
- A typical Quran app that assumes you read Arabic and treats translations as afterthoughts

### Tone of system text:
- Warm but not saccharine
- Respectful of the sacred nature of the content
- Never prescriptive about how to practice faith
- Humble about what the AI doesn't know
- Never uses exclamation marks in system messages
- Never assumes the user's level of Arabic proficiency

---

## Accessibility Requirements

- **Screen reader:** Every element labeled. Arabic text marked `lang="ar"`. Panels announce on open ("Tafsir panel opened for verse 2:65"). Toggle states announced ("Arabic text: off").
- **Keyboard:** Full keyboard navigation. Tab through verses, Enter to open preview, arrow keys within panels, Escape to close, Cmd/Ctrl+K for palette. All toggles have keyboard shortcuts.
- **Font scaling:** Respects system font size. Arabic and translation sizes independently adjustable. Layout must not break at 200% zoom.
- **Color contrast:** WCAG AA in both light and dark. Indicators don't rely solely on color (distinct shapes).
- **Reduced motion:** Toggle to disable all animations. Panels appear/disappear instantly.
- **RTL support:** Full RTL for Arabic content. Mixed LTR/RTL (Arabic + English) handled correctly. When Arabic is toggled off, the layout is fully LTR.
- **Touch targets:** 44x44pt minimum on mobile.
- **High contrast mode:** Toggleable. Removes subtle/glass effects, maximizes text-to-background contrast.

---

## Platform-Specific Behaviors

### Desktop (1024px+)

- Reading surface occupies center with controlled margins (adjustable via density)
- Side panel docks right; bottom panel docks below. Both resizable by dragging dividers (like VS Code).
- Multiple panels simultaneously: tafsir right + notes right (tabbed) + AI bottom
- Activity bar on far left (thin, always visible, toggleable)
- Keyboard shortcuts for everything
- Hover states on verses
- Command palette (Cmd+K)
- Zen mode (F11 or toggle)
- Mind maps: full mouse interaction (click, drag, scroll-zoom)
- Columnar translation layout available
- Minimap toggle (visual surah position indicator on right edge, like VS Code's minimap)

### Tablet (768px - 1023px)

- Reading surface full width
- Panels open as overlapping sheets from right, narrower than desktop
- One panel visible at a time (plus reading surface peeking)
- Landscape: side-by-side (reading + one panel) like desktop
- Touch interactions match mobile
- No activity bar; use top bar icons or swipe gestures to access panels

### Mobile (< 768px)

- Reading surface full width, edge to edge
- Panels open as bottom sheets (slide up, swipe down to dismiss)
- Active verse peeks at top of sheet so reading position is visible
- Bottom navigation: Home, Surahs, Knowledge, Search (4 items maximum)
- Audio dock sits above bottom nav
- Microphone icon always accessible for voice notes
- One-handed reachability: critical actions in bottom half
- Command palette: pull down on reading surface, or tap search in top bar
- No columnar layout; stacked or focused+tabs only
- Compact and dense density presets are most useful here

---

## Multi-Device Sync Behavior

- **Sync scope:** Reading position, bookmarks, notes (including audio), preferences, workspace presets, AI conversations, mind maps, reading journey data.
- **Sync timing:** Near-real-time when online. Queued when offline, synced on reconnect.
- **Conflict resolution:** Last-write-wins for simple data. Notes show conflict indicator with merge option.
- **Workspace presets are per-device by default** (a desktop preset with 3 panels doesn't make sense on mobile). The user can opt to sync presets across devices if they want.
- **Handoff:** The user reads verse 45 on their phone. They sit at their desk, open the app — they're at verse 45. The workspace layout is their desktop preset, but the reading position came from the phone. **Position follows the user. Layout follows the device.**

---

## Export & Sharing

- **Export notes:** All notes or filtered set → Markdown, JSON, or PDF. Includes verse references, tags, source attributions, and (optionally) embedded audio transcriptions.
- **Export bookmarks:** All bookmarks or filtered → Markdown or JSON. Includes verse text in selected translations.
- **Export mind map:** As image (PNG/SVG) or as structured data (JSON).
- **Share a verse:** Select verse → share button → generates a clean text card with Arabic (if enabled) + selected translation + verse reference. Copyable or shareable via system share sheet.
- **Share a note:** Export a single note as formatted text with all its embedded references and clips.
- **No social features.** Sharing is always out (to clipboard, to another app). Never in (no feeds, no comments from others, no public profiles).

---

## Notification Philosophy

The app sends **almost no notifications.**

- **No "come back and read" reminders.** Ever.
- **No "daily verse" push notifications.**
- **No streak reminders.**
- **Sync completion:** Silent. Maybe a subtle badge if there was a conflict to resolve.
- **Transcription complete:** Silent badge on the note. No push notification.
- **The only notification the app might send:** If the user explicitly sets a personal reading reminder (opt-in, not suggested). And even then, it should be gentle and dismissable permanently.

---

## What Success Looks Like

A user who has used this app for a year should be able to:

1. Open the app and be reading within 1 second
2. Read comfortably in any language combination — with or without Arabic
3. See 15+ verses on screen in compact mode and never feel cramped
4. Find any note they've ever written within 3 taps or a Cmd+K search
5. Have their workspace set up exactly the way they like it, restored perfectly every session
6. Study a verse deeply — tafsir, hadith, cross-references — without ever feeling lost
7. Toggle any feature on or off without disrupting everything else
8. See the structure of their accumulated knowledge as a mind map and discover connections they didn't consciously make
9. Return after months of absence and feel welcomed, not guilted
10. Explain to a friend what the app does: "It's where I study the Quran. It remembers everything I learn and lets me set it up exactly how I want."

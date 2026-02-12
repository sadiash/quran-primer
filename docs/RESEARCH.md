# Data Sources Research — The Primer

*Comprehensive survey of every known Quran database, dataset, and API that could feed our PostgreSQL database. Evaluated for: content depth, format, license, maintenance status, and fit for this project.*

---

## Table of Contents

1. [PostgreSQL-Native Databases](#1-postgresql-native-databases)
2. [SQL Databases (MySQL/SQLite)](#2-sql-databases-mysqlsqlite)
3. [JSON/CSV Dataset Repositories](#3-jsoncsv-dataset-repositories)
4. [Tafsir-Specific Sources](#4-tafsir-specific-sources)
5. [Morphology & Linguistic Sources](#5-morphology--linguistic-sources)
6. [Hadith Data Sources](#6-hadith-data-sources)
7. [Audio Data Sources](#7-audio-data-sources)
8. [Canonical Text Sources](#8-canonical-text-sources)
9. [Runtime APIs](#9-runtime-apis)
10. [Proposed Data Strategy](#10-proposed-data-strategy)

---

## 1. PostgreSQL-Native Databases

### 1A. misraj-ai/quranhub

**URL:** https://github.com/misraj-ai/quranhub
**Format:** PostgreSQL dump (`quranhub_snapshot_dump.sql`)
**License:** Non-Commercial License (NCL) — free for non-commercial use; commercial requires written permission from Misraj AI
**Maintained:** Active (17 commits, live API at api.quranhub.com)
**Stack:** FastAPI + SQLAlchemy 2.0 + Python 3.9+

**Data volume:**

| Category | Count |
|----------|-------|
| Total editions | 430+ (342 text, 88 audio) |
| Translations | 164 across 50+ languages |
| Tafsir editions | 156 |
| Surah recitations | 45 |
| Verse-by-verse audio editions | 43 |
| Quran script variants | 12 |
| Analyzed Quranic words | 77,433 |
| Unique morphological tags | 2,468 |
| Arabic roots | 1,805 |
| Word-tag associations | 2.5 million |
| Audio file references | 354,346 |

**Features included:**
- Full-text search (Arabic + translations)
- Morphological analysis and root-based lookup
- Tajweed rule annotations
- Similar verse discovery (mutashabihat)
- Word-by-word images
- Mushaf layout data
- Theme-based verse discovery
- Sajda verse identification
- Audio recitation metadata with narrator details

**Import:** `psql -U quran -d quran_study -f database/quranhub_snapshot_dump.sql`

**Assessment:** The single most comprehensive Quran database found. Already PostgreSQL, includes nearly everything: translations, tafsir, morphology, audio, themes, tajweed. The major caveat is the Non-Commercial License — fine for personal/educational projects, commercial requires permission.

---

### 1B. TarteelAI/quranic-universal-library (QUL)

**URL:** https://github.com/TarteelAI/quranic-universal-library
**Format:** PostgreSQL dump (SQL + binary)
**License:** MIT (permissive)
**Maintained:** Very active (879 commits, 673 stars, 18 contributors)
**Stack:** Ruby on Rails 7, Redis 7
**Database:** PostgreSQL 14.3+

**What it contains:**
- CMS for managing Quranic content
- Database `quran_dev` with translations, tafsirs, audio, Arabic scripts
- Morphology and grammar data management
- Mushaf layout data
- Mutashabihat (similar verses)
- Multi-language surah information
- Audio segment management (ayah-by-ayah and gapless)

**Caveats:**
- Only a **mini database dump** is provided publicly for development — not the full database
- "We do not provide or share the full database backup"
- Full data available at https://qul.tarteel.ai/resources or by request

**Assessment:** MIT licensed and PostgreSQL-native, which is ideal. This is the same data that powers quran.com. However, getting the full dataset requires using their CMS interface or contacting them directly. The mini dump works for dev/testing.

---

## 2. SQL Databases (MySQL/SQLite)

### 2A. AbdullahGhanem/quran-database

**URL:** https://github.com/AbdullahGhanem/quran-database
**Format:** MySQL dump (`quran.sql.zip`)
**License:** Not explicitly stated
**Maintained:** Low activity; last updated ~2022
**Stars:** 749

**Schema (4 tables):**

| Table | Rows | Description |
|-------|------|-------------|
| `surahs` | 114 | Surah metadata (name, number, revelation type) |
| `ayahs` | 6,236 | Individual verses linked to surahs |
| `editions` | ~130-170 | Available editions/translations |
| `ayah_edition` | ~800K+ | Junction table: each ayah's text in each edition |

**What it contains:**
- Arabic Quran text
- Translations in multiple languages
- Mirrors alquran.cloud API data (the repo author also built a Laravel API wrapper around it)

**What it lacks:**
- No tafsir
- No word-by-word analysis
- No morphology
- No audio metadata
- No themes/topics

**Assessment:** Straightforward, normalized relational dump. Easy to convert to PostgreSQL (`mysqldump` → `pgloader` or manual conversion). But it's shallow — good for basic text + translations only. Would need heavy supplementation for a study app.

---

### 2B. Abdallah-Mekky/Quran-Database

**URL:** https://github.com/Abdallah-Mekky/Quran-Database
**Format:** SQLite (`quran.db`)
**License:** Not specified
**Maintained:** Minimal (6 commits, Nov 2023)

**Schema (single table, 18 fields):**

| Field | Description |
|-------|-------------|
| `aya_text` | Verse text (plain) |
| `aya_text_emlaey` | Verse text (imla'i script) |
| `aya_text_tashkil` | Verse text (with tashkeel/diacritics) |
| `sora_name_ar` | Surah name (Arabic) |
| `sora_name_en` | Surah name (English) |
| `page`, `jozz` | Structural divisions |
| `maany_aya` | Verse meanings |
| `earab_quran` | **Grammatical parsing (i'rab)** |
| `reasons_of_verses` | **Asbab al-Nuzul (revelation context)** |
| `tafseer_saadi` | Tafsir Al-Sa'di |
| `tafseer_moysar` | Tafsir Al-Muyassar |
| `tafseer_bughiu` | Tafsir Al-Baghawi |

**Assessment:** Small but contains **unique data** that most other databases lack — specifically grammatical parsing (i'rab) and revelation context (asbab al-nuzul). Arabic-only. Easy to convert to PostgreSQL. Valuable as a supplement even if not used as a primary source.

---

### 2C. SalamQuran MySQL Databases

**URLs:**
- https://github.com/salamquran/SalamQuran-mysql-translations
- https://github.com/salamquran/SalamQuran-mysql-words

**Format:** MySQL dumps (`.sql` files)
**License:** Not specified
**Maintained:** Archived (read-only since Aug 2023)

**Translations database:**
- 112 separate SQL dump files
- 40+ languages
- Notable coverage: 16 English, 12 Persian, 10 Turkish, 9 Russian, 9 Urdu translations

**Words database:**
- Complete word-by-word analysis
- Linguistic and grammatical information for each word
- Powers the SalamQuran.com platform

**Assessment:** Good supplementary data. The word-by-word database is particularly valuable for the word-level analysis features in our app. Archived but data is immutable/still valid.

---

## 3. JSON/CSV Dataset Repositories

### 3A. fawazahmed0/quran-api

**URL:** https://github.com/fawazahmed0/quran-api
**Format:** JSON files via CDN (jsdelivr)
**License:** Unlicense (public domain)
**Maintained:** Active (617 commits)

**Data:**
- **440+ translations** in **90+ languages** — the largest collection in a single repository
- Includes transliterations with diacritical marks
- Organized by: edition, chapter, verse, juz, ruku, page, manzil, maqra
- Quran metadata (juzs, sajdas, rukus counts)

**Assessment:** Public domain license is ideal — no restrictions whatsoever. JSON format is easy to parse and import. No rate limits, CDN-hosted. Best source for sheer translation breadth.

---

### 3B. islamAndAi/QURAN-NLP

**URL:** https://github.com/islamAndAi/QURAN-NLP
**Format:** CSV files
**License:** Apache 2.0 (permissive)
**Maintained:** Active (137 commits, March 2023+)

**Data:**

| Dataset | Size |
|---------|------|
| Verses with corpus linguistics | 190,655 entries |
| Dictionary | 53,924 entries |
| Morphology | 128,219 entries |
| Verbs | 1,475 |
| Lemmas | 3,680 |
| Tafsir sets | 4 |
| English translations | 9 |
| **Hadiths** | **700,000+** (from multiple sources including 650K via Kaggle) |
| Hadith narrators (rawis) | 24,028 |
| 99 Names of Allah | Included |

**Assessment:** The best single source for combined Quran + Hadith NLP data. Apache 2.0 license is permissive. Particularly valuable for the hadith cross-reference potential and the narrator database.

---

## 4. Tafsir-Specific Sources

### 4A. spa5k/tafsir_api

**URL:** https://github.com/spa5k/tafsir_api
**Format:** JSON files served via CDN
**License:** MIT
**Maintained:** Active (79 commits)

**27 tafsirs available:**

| Language | Tafsirs |
|----------|---------|
| Arabic (7) | Ibn Kathir, Al-Baghawi, Al-Tabari, Al-Qurtubi, Al-Saddi, Tanwir al-Miqbas, Al-Wasit |
| English (10) | Ibn Kathir (abridged), Al-Jalalayn, Kashani, Tustari, Al-Qushairi, Kashf Al-Asrar, + more |
| Bengali (4) | Ibn Kathir, Ahsanul Bayaan, Fathul Majid, Abu Bakr Zakaria |
| Urdu (3) | Ibn Kathir, Bayan ul Quran, Tazkirul Quran |
| Kurdish (1) | — |
| Russian (1) | — |

**Assessment:** Excellent tafsir source. MIT licensed, well-structured JSON (one file per tafsir per surah), easy to import into PostgreSQL. Complements QuranHub's tafsir data.

---

## 5. Morphology & Linguistic Sources

### 5A. The Quranic Arabic Corpus (corpus.quran.com)

**URL:** https://corpus.quran.com/download/
**Format:** Tab-separated text file (morphological annotations)
**License:** GNU GPL — verbatim copying OK, modification prohibited, attribution required
**Maintained:** Version 0.4; now maintained by the quran.com team

**Data (77,430 words):**

| Feature | Description |
|---------|-------------|
| Morphological annotation | Part-of-speech tags, multiple morphological features per word |
| Syntactic treebank | Dependency grammar trees for every verse |
| Semantic ontology | 300 linked concepts with 350 relations |
| Quranic dictionary | Root words, meanings, grammatical forms |
| Topics/concepts index | Linked to specific verses |

**Download:** Requires email verification at corpus.quran.com/download/

**Improved fork:** https://github.com/mustafa0x/quran-morphology — fixes many root/lemma issues from v0.4

**Assessment:** The definitive source for Arabic linguistic analysis of the Quran. Essential for word-by-word morphology features. The semantic ontology provides the closest thing to a structured "themes/topics per verse" index. The improved fork at mustafa0x is recommended over the original v0.4.

---

## 6. Hadith Data Sources

### 6A. sunnah.com API

**URL:** https://sunnah.com/developers
**Format:** JSON API
**License:** Requires API key (request via GitHub issue)
**Maintained:** Active, authoritative

**Collections available:**
- Sahih al-Bukhari
- Sahih Muslim
- Sunan Abu Dawud
- Jami' at-Tirmidhi
- Sunan an-Nasa'i
- Sunan Ibn Majah
- Muwatta Imam Malik
- + additional collections

**Features:**
- Arabic + English text
- Hadith grading
- Book/chapter structure
- Narrator chains (isnad)
- Offline data dumps available on request

**Assessment:** The authoritative source for hadith data. Essential for Phase 7 (cross-referencing). API key is free but requires a request.

---

### 6B. AhmedBaset/hadith-json

**URL:** https://github.com/AhmedBaset/hadith-json
**Format:** JSON
**License:** Not specified
**Maintained:** Active

**Data:**
- 50,884 hadiths from 17 books including the 9 canonical collections
- Scraped from sunnah.com
- Structured JSON format

**Assessment:** Good for bulk import without needing API rate limits. Covers the major collections.

---

### 6C. mhashim6/Open-Hadith-Data

**URL:** https://github.com/mhashim6/Open-Hadith-Data
**Format:** CSV
**License:** Not specified
**Maintained:** Available

**Data:**
- 9 hadith books in CSV format
- Arabic with and without diacritics
- Includes hadith elaboration text

**Assessment:** Easy CSV import via PostgreSQL `COPY` command. Good complement to JSON sources.

---

## 7. Audio Data Sources

### 7A. cpfair/quran-align

**URL:** https://github.com/cpfair/quran-align
**Format:** Data files (timestamps)
**License:** Not specified
**Maintained:** Available via Releases

**Data:**
- Word-precise audio segmentation timestamps
- Start/end timestamps for every word in recorded recitations
- Multiple qurra (reciters) available

**Assessment:** Critical for the verse-by-verse audio highlighting feature described in the UX spec. Without word-level timestamps, audio sync is verse-level only.

---

### 7B. Quran.com Audio API

Available via the Quran.com API v4 (see Runtime APIs section). Provides:
- Chapter-level and verse-level audio files
- Timing data with word-level timestamp ranges
- Multiple reciters with metadata (name, style, format)

---

## 8. Canonical Text Sources

### 8A. Tanzil.net

**URL:** https://tanzil.net/download/
**Format:** Plain text, XML, MySQL dump
**License:** Free to copy/distribute verbatim; no modification allowed; attribution required
**Maintained:** Version 1.1 (Feb 2021) — stable canonical source

**Quran text variants:**

| Script | Variants |
|--------|----------|
| Simple | Plain, Minimal, Clean |
| Uthmani | Standard, Minimal |

**Optional marks:** Pause marks, sajdah signs, rub-el-hizb signs, tatweel marks

**Translations:** https://tanzil.net/trans/
- **190 translations** across **50+ languages**
- 16 English, 12 Persian, 10 Turkish, 9 Russian, 9 Urdu, 4 German, 3 Spanish, 3 Albanian, 3 Dutch, 2 Chinese, and many more
- Each translation downloadable individually in XML or text format

**Assessment:** Tanzil is the gold standard canonical source for authentic Quranic text. The Quranic Arabic Corpus is based on Tanzil. Many other projects source from here. Essential reference for verifying text integrity.

---

### 8B. QuranEnc.com (Encyclopedia of the Noble Quran)

**URL:** https://quranenc.com/en/home/api/
**Format:** JSON API + downloadable XML/CSV/Excel
**License:** Free to re-publish with conditions: no modification, cite source with version, maintain transcript info
**Maintained:** Active (official project of the Saudi government)

**Data:**
- **70+ languages** with multiple translations per language
- Translations include **footnotes** (unique feature — most other sources strip footnotes)
- Verse-level and surah-level retrieval

**API endpoints:**
- `GET /api/v1/translations/list/` — list available translations
- `GET /api/v1/translation/sura/{key}/{sura}` — full surah translation
- `GET /api/v1/translation/aya/{key}/{sura}/{aya}` — single verse

**Assessment:** Very high-quality, government-backed translations with scholarly footnotes. The footnotes are a differentiator — most databases lose them. Excellent supplementary source especially for languages not well covered elsewhere.

---

## 9. Runtime APIs

### 9A. Quran.com API v4 (Quran Foundation)

**Base URL:** `https://apis.quran.foundation/content/api/v4/`
**Docs:** https://api-docs.quran.foundation/
**Auth:** OAuth2 Client Credentials (client_id + client_secret required)
**Format:** JSON
**Rate limits:** Not explicitly documented; 429 responses indicate limit exceeded
**Token lifetime:** 3600 seconds

**Endpoints (66+):**

| Category | Endpoints | Data |
|----------|-----------|------|
| Chapters | 3 | Surah metadata, info, translated names |
| Verses | 10 | By chapter, page, juz, hizb, rub el hizb, ruku, key, random |
| Translations | 8 | Multiple translations per verse, with footnotes |
| Tafsirs | 8 | Multiple tafsir commentaries per verse |
| Audio | 15 | Recitations, chapter audio, verse audio, timing/segments |
| Quran Scripts | 11 | Uthmani, Indopak, Imlaei text in different formats |
| Resources | 9 | Available translations, tafsirs, reciters, languages, styles |
| Juz/Hizb/Ruku/Manzil | 8 | Structural divisions |
| Search | Available | Full-text search across translations |
| Footnotes | 1 | Translation footnotes |

**Word-level data:**
- Word text (in multiple scripts)
- Word translation
- Word transliteration
- Word audio URL
- Word position

**SDK:** `npm install @quranjs/api` (handles auth, caching, retries)

**Assessment:** The most feature-rich API. Best for supplementing local data with dynamic content (audio streaming URLs, latest translations). Requires OAuth2 registration. The SDK simplifies integration for Next.js.

---

### 9B. AlQuran.cloud API

**Base URL:** `https://api.alquran.cloud/v1/`
**Docs:** https://alquran.cloud/api
**Auth:** None required (open access)
**Format:** JSON
**Rate limits:** Not documented
**Compression:** gzip and zstd supported

**170 total editions:**

| Type | Count |
|------|-------|
| Translations | 132 |
| Tafsirs | 4 |
| Quran text variants | 10 |
| Verse-by-verse audio | 22 |
| Transliterations | 2 |
| Languages | 52 |

**Key endpoints:**
- `/edition` — list all editions, filter by format/language/type
- `/quran/{edition}` — **complete Quran in one API call**
- `/surah/{number}/{edition}` — single surah
- `/ayah/{reference}/{edition}` — single verse
- `/juz/{number}/{edition}`, `/page/`, `/hizb/`, `/manzil/`, `/ruku/` — structural divisions
- `/search/{keyword}/{surah}/{edition}` — text search
- `/sajda/{edition}` — prostration verses
- `/meta` — complete structural metadata

**Assessment:** No authentication required — easiest API to start with. The `/quran/{edition}` endpoint fetches an entire translation in one call, making it efficient for seeding a database. Fewer editions than quran.com but sufficient for most needs.

---

## 10. Proposed Data Strategy

### Phase 1 — Foundation (immediate)

Start with **QuranHub's PostgreSQL dump**. One import gives us:
- Arabic text in 12 script variants
- 164 translations across 50+ languages
- 156 tafsirs
- 77K+ words with morphological analysis
- Audio metadata for 88 editions
- Theme/topic data
- Similar verse mappings

This covers ~80% of what the app needs through Phase 5 of the roadmap.

### Phase 2 — Fill gaps

| Source | What it adds | Priority |
|--------|-------------|----------|
| spa5k/tafsir_api | Additional tafsirs not in QuranHub (MIT licensed) | High |
| fawazahmed0/quran-api | Additional translations up to 440+ (public domain) | High |
| Abdallah-Mekky/Quran-Database | Asbab al-nuzul (revelation context), i'rab (grammatical parsing) | High |
| QuranEnc.com | Translations with scholarly footnotes | Medium |
| Quranic Arabic Corpus (mustafa0x fork) | Syntax trees, semantic ontology, improved morphology | Medium |

### Phase 3 — Hadith layer (Phase 7 of roadmap)

| Source | What it adds | Priority |
|--------|-------------|----------|
| islamAndAi/QURAN-NLP | 700K+ hadiths, narrators database | High |
| sunnah.com API | Verified, graded hadith with isnad chains | High |
| AhmedBaset/hadith-json | Bulk hadith import (50K+ from 17 books) | Medium |

### Phase 4 — Audio enrichment

| Source | What it adds | Priority |
|--------|-------------|----------|
| cpfair/quran-align | Word-level audio timestamps for verse highlighting | High |
| Quran.com API v4 | Streaming audio URLs, latest reciter data | Medium |

### Phase 5 — Runtime API supplements

| Source | Purpose |
|--------|---------|
| Quran.com API v4 | Dynamic content: latest translations, audio streaming, word-by-word images |
| AlQuran.cloud | No-auth fallback for translations and audio |
| QuranEnc.com | Footnoted translations on demand |

### Format conversion reference

| Source | Native Format | → PostgreSQL Difficulty |
|--------|--------------|------------------------|
| QuranHub | PostgreSQL SQL | None (direct import) |
| QUL (Tarteel) | PostgreSQL SQL | None (direct import) |
| AbdullahGhanem | MySQL SQL | Low (pgloader or manual) |
| Abdallah-Mekky | SQLite | Low (pgloader or script) |
| Tanzil | XML/MySQL/Text | Low-Medium |
| fawazahmed0 | JSON | Low (import script) |
| spa5k/tafsir_api | JSON | Low (import script) |
| Corpus morphology | TSV text | Medium (parsing needed) |
| QURAN-NLP | CSV | Low (COPY command) |
| SalamQuran | MySQL SQL | Low (pgloader or manual) |

### Key principle

Quranic text is immutable. Translations and tafsirs change rarely. Bundling locally is the right strategy — it makes the app fast, offline-capable, and independent of external APIs for core reading and study. APIs are for supplementary, dynamic content only (audio streaming, latest editions, AI features).

---

## License Summary

| Source | License | Commercial OK? |
|--------|---------|----------------|
| QuranHub | Non-Commercial | No (need permission) |
| QUL (Tarteel) | MIT | Yes |
| AbdullahGhanem | Unstated | Unclear |
| Abdallah-Mekky | Unstated | Unclear |
| SalamQuran | Unstated | Unclear |
| fawazahmed0 | Unlicense (public domain) | Yes |
| spa5k/tafsir_api | MIT | Yes |
| islamAndAi/QURAN-NLP | Apache 2.0 | Yes |
| Tanzil | Free with attribution | Yes (with attribution) |
| QuranEnc | Free with conditions | Yes (with conditions) |
| Quranic Arabic Corpus | GNU GPL | Yes (with GPL terms) |
| Quran.com API | OAuth2 required | Per their terms |
| AlQuran.cloud | Open access | Per their terms |

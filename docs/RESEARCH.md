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
11. [Quranic Ontology & Concept Mapping](#11-quranic-ontology--concept-mapping)
12. [Hadith Ontology & Knowledge Graphs](#12-hadith-ontology--knowledge-graphs)
13. [Quran-Hadith Cross-Referencing](#13-quran-hadith-cross-referencing)
14. [Semantic Search Implementation](#14-semantic-search-implementation)

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
| SemanticHadith V2 KG | CC0-1.0 (Public Domain) | Yes |
| CANERCorpus | Not specified | Unclear |
| seelenbrecher/islamic-agent ontology.json | Not specified | Unclear |
| ShathaTm/Quran_Hadith_Datasets | Not specified | Academic use |

---

## 11. Quranic Ontology & Concept Mapping

### 11A. Quranic Arabic Corpus — Semantic Ontology (Deep Dive)

**URL:** https://corpus.quran.com/ontology.jsp
**JSON extract:** https://github.com/seelenbrecher/islamic-agent/tree/master/data/quran_data
**License:** GNU GPL (corpus), extract license unclear
**Maintained:** v0.4 by University of Leeds / quran.com team

The Quranic Arabic Corpus provides a **semantic ontology of ~300 concepts** linked by **~350 relations** covering the entire Quran. This is the most structured "themes/topics per verse" index available.

**12 Top-Level Categories:**

| Category | Example Concepts |
|----------|-----------------|
| **Living Creation** | Prophets (24), Messengers (12), Angels (6), Historic Peoples (16), Historic Persons (15), Jinn |
| **Location** | Makkah, Medinah, Paradise, Hell, Firdous, Saqar, Babylon, Badr |
| **Event** | Day of Resurrection, Last Day, Al-Jahiliyah |
| **Holy Book** | Quran, Torah, Injeel (Gospel), Zabur (Psalms) |
| **Artifact** | Ark of the Covenant, Noah's Ark, Mosques, Churches, Weaponry |
| **Religion** | Islam, Christianity, Judaism, Magians, Sabians |
| **Astronomical Body** | Sun, Moon, Earth, Stars, Constellations |
| **Physical Substance** | Clay, Coral, Pearl, Silk, Metals, Minerals |
| **False Deity** | Al-Uzza, Allat, Baal, Manat, Idols |
| **Weather Phenomena** | Cloud, Lightning, Rain, Thunder |
| **Physical Attribute** | Colors |
| **Language** | Arabic |

Plus two root-level instances: **Allah** (2,721 verses) and **Allah's Throne**.

**How Concepts Map to Verses:**

Concepts are mapped **per-word** (named entity tagging + pronoun resolution). The public interface surfaces this as per-verse lists. Examples:
- **Allah** → 2,721 verses
- **Quran** → 69 verses
- **Sun** → 33 verses

**Available as JSON (`ontology.json`):**

```json
{
  "allah": {
    "Definition": "the one and only true God...",
    "Subcategories": [],
    "Related Concepts": [],
    "Verses List": [{"surah_id": 1, "verse_id": 1}, ...] // 2721 entries
  },
  "fasting": {
    "Definition": "...",
    "Subcategories": [...],
    "Related Concepts": [...],
    "Verses List": [{"surah_id": 2, "verse_id": 183}, ...]
  }
}
```

**Hierarchy example (Living Creation):**
```
Concept (root)
  └── Living Creation
        └── Sentient Creation
              ├── Angel (6): Azrael, Harut, Jibreel, Malik, Marut, Mikaeel
              ├── Human
              │     ├── Historic People (16): Aad, Thamud, Quraysh, Children of Israel, Romans...
              │     ├── Historic Person (15): Maryam, Pharaoh, Luqman, Dhul Qarnayn...
              │     ├── Messenger (12): Ibrahim, Musa, Jesus, Muhammad, Nuh...
              │     └── Prophet (24): Adam, Yusuf, Ayyub, David, Solomon...
              ├── Jinn
              └── Beast of the Earth
```

**Assessment:** This is the **concept bridge** to hadith. When a user reads verse 2:183, we can look up its concepts (`fasting`, `ramadan`), then find hadiths discussing those same topics. The `ontology.json` from seelenbrecher/islamic-agent is immediately usable — no scraping needed.

---

### 11B. Quranic Arabic Corpus — Morphological Data

**URL:** https://corpus.quran.com/download/
**Improved fork:** https://github.com/mustafa0x/quran-morphology
**Format:** Tab-separated text (Buckwalter transliteration), 77,430 words
**License:** GNU GPL

**Sample format** (`surah:ayah:word:segment`):
```
1:1:1:1    bi      P     PREF|LEM:b
1:1:1:2    somi    N     ROOT:smw|LEM:{som|M|GEN
1:1:2:1    {ll~ahi PN    ROOT:Alh|LEM:{ll~ah|GEN
```

**Features per token:** Part-of-speech tag (~40+ tags), root, lemma, gender, number, case, mood, verb form, aspect, voice.

**Additional resources:**
- `morphology-terms-ar.json` (Arabic definitions) from mustafa0x fork
- JQuranTree Java API (`corpus.quran.com/java`) for programmatic access
- Syntactic treebank (dependency grammar trees for every verse)

---

## 12. Hadith Ontology & Knowledge Graphs

### 12A. SemanticHadith Knowledge Graph V2 (Primary Resource)

**GitHub:** https://github.com/A-Kamran/SemanticHadith-V2
**Docs:** https://a-kamran.github.io/SemanticHadith-V2/
**V1 Docs:** https://a-kamran.github.io/SemanticHadithKG/
**Figshare (V1 RDF):** https://figshare.com/articles/dataset/Semantic_Hadith_RDF/7964558
**License:** CC0-1.0 (Public Domain)
**Papers:**
- [SemanticHadith: An ontology-driven knowledge graph (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S1570826823000264)
- [Semantic Enrichment of Hadith Corpus (Semantic Web Journal)](https://www.semantic-web-journal.net/content/semantic-enrichment-hadith-corpus-knowledge-graph-generation-islamic-text)

**Collections covered:** All 6 major hadith collections (Bukhari, Muslim, Abu Dawud, Ibn Majah, Nasa'i, Tirmidhi).

**V2 Ontology Classes:**

| Category | Classes |
|----------|---------|
| Hadith structure | `Hadith`, `HadithText`, `HadithCollection`, `HadithBook`, `HadithChapter` |
| Narration | `HadithNarrator`, `RootNarrator`, `HadithCollectionAuthor`, `ChainOfNarrators`, `NarratorChainSegment` |
| Hadith types | `ElevatedHadith`, `SacredHadith`, `SeveredHadith`, `StoppedHadith` |
| People | `Believer`, `Companion`, `Prophet`, `WifeOfProphet` |
| Supernatural | `Angel`, `Jinn` |
| Groups | `Nation`, `Tribe`, `HistoricGroupOfPeople` |
| Nature | `Animal`, `Plant` |
| Locations | `GeographicalLocation`, `DivineLocation` |
| **Topics** | **`Topic` (parent), `ArticlesOfFaith`, `PillarsOfIslam`, `Crime`** |

**Critical V2 properties:**
- **`discussesTopic`** — links hadiths to topic categories
- **`containsMentionOfVerse`** — links hadiths to specific Quran verses
- **`containsMentionOf`** / **`mentionedIn`** — entity cross-references

**Downloadable files:**
- `SemanticHadith2.0.owl` — OWL ontology definition
- `SemanticHadithKGV2.ttl.zip` — Full knowledge graph in Turtle/RDF format

**SPARQL endpoint:** `http://semantichadith.com:8890/sparql/` (intermittent availability)

**Assessment:** This is the single most valuable resource for hadith-verse linking. The V2 ontology has **topic tagging**, **named entity extraction**, and **direct Quran verse cross-references** per hadith. CC0 license means zero restrictions. The TTL file can be parsed to extract structured JSON mappings.

---

### 12B. CANERCorpus — Named Entity Recognition for Hadith

**URL:** https://github.com/RamziSalah/Classical-Arabic-Named-Entity-Recognition-Corpus
**Size:** 7,000+ hadiths from Sahih Al-Bukhari, 258,241 words, 72,000+ named entities
**Formats:** CSV, JSON, SQL, TXT, XLSX, XML, CoNLL

**20 Entity Classes:**
Allah, Prophet, Paradise, Hell, Religion, Person, Location, Organization, Measurement, Money, Book, Date, Time, Clan, Natural Object, Crime, Day, Number, Sect, Month

**Assessment:** Manually annotated by human experts — high quality. The entity classes overlap significantly with the Quranic ontology categories (Prophet, Angel, Location, etc.), making it a natural bridge dataset.

---

### 12C. HuggingFace Hadith Datasets (with Topic Proxies)

**meeAtif/hadith_datasets:**
- URL: https://huggingface.co/datasets/meeAtif/hadith_datasets
- Size: 33.7K hadiths, 6 major books
- Fields: `Book`, `Chapter_Number`, `Chapter_Title_Arabic`, `Chapter_Title_English`, `Arabic_Text`, `English_Text`, `Grade`, `Reference`
- License: MIT
- **323 unique English chapter titles** serve as topic labels

**gurgutan/sunnah_ar_en_dataset:**
- URL: https://huggingface.co/datasets/gurgutan/sunnah_ar_en_dataset
- Size: 50,762 hadiths, 14 books (including Musnad Ahmad at 36,164)
- Fields: `book_id`, `book_title_en/ar`, `hadith_chapter_id`, `hadith_chapter_name_en/ar`, `hadith_text_en/ar`, `hadith_narrator_en`
- License: MIT
- **530 unique English chapter names** as topic labels

**cibfaye/hadiths_dataset:**
- URL: https://huggingface.co/datasets/cibfaye/hadiths_dataset
- Size: 37.3K hadiths, 15 collections (including Riyad as-Salihin, Mishkat, Bulugh al-Maram)

---

### 12D. Additional Hadith Data Repositories

**AhmedBaset/hadith-json:**
- URL: https://github.com/AhmedBaset/hadith-json
- 50,884 hadiths across 17 books in structured JSON
- Fields: `id`, `chapterId`, `bookId`, `arabic`, `english` (with `narrator` + `text`)

**abdelrahmaan/Hadith-Data-Sets:**
- URL: https://github.com/abdelrahmaan/Hadith-Data-Sets
- 62,169 hadiths, 9 books, CSV/JSON, with/without tashkil

**fawazahmed0/hadith-api:**
- URL: https://github.com/fawazahmed0/hadith-api
- CDN-hosted JSON, no API key, multiple languages/grades

---

### 12E. Rezwan Corpus (Upcoming — Largest Known)

**Paper:** [Rezwan: Leveraging LLMs for Comprehensive Hadith Text Processing](https://arxiv.org/abs/2510.03781) (October 2025)
- Size: 1.2M+ narrations, ~392 million words
- Features: Machine translation (12 languages), diacritization, abstractive summaries, **thematic tagging**, semantic relationship mapping
- Quality: Mean 8.46/10 across all dimensions
- Status: Paper published, dataset availability unclear — may need to contact authors

---

## 13. Quran-Hadith Cross-Referencing

### 13A. The Problem

**No comprehensive, production-ready dataset exists that maps specific Quran verses to specific hadiths.** This is a recognized gap in Islamic digital scholarship. What exists falls into: small academic datasets, semantic search tools, ontology projects, and standalone corpora that can be combined.

---

### 13B. Direct Mapping Datasets

**ShathaTm/Quran_Hadith_Datasets (Best Direct Match):**
- URL: https://github.com/ShathaTm/Quran_Hadith_Datasets
- Paper: [Challenging the Transformer-based models (LREC 2022)](https://aclanthology.org/2022.lrec-1.157/)
- Thesis: [Artificial Intelligence for Understanding the Hadith (2023)](https://etheses.whiterose.ac.uk/id/eprint/32802/1/Altammami_SH_Computing_PhD_2023.pdf)
- Data: **310 balanced pairs** of related/non-related Quran-verse and Hadith-teaching pairs + **4,072 balanced Quran-verse pairs**
- Built from: Archived Fatwas of Islamic scholars
- Quality: HIGH (peer-reviewed, LREC 2022) but too small for production (310 pairs)

---

### 13C. Semantic Search Projects (Compute-at-Runtime)

**BasilSuhail/Quran-Hadith-Application-Database:**
- URL: https://github.com/BasilSuhail/Quran-Hadith-Application-Database
- Approach: Sentence Transformers + FAISS indices
- Data: 6,236 verses (88 translations, 23 languages) + 15,432 hadiths
- Stack: Flask, SQLite, FAISS
- No static mapping — computes similarity at query time

**kyb3r/quranic:**
- URL: https://github.com/kyb3r/quranic
- Python semantic search on Quran + Hadith using sentence embeddings

**moinul-hossain-dhrubo/quran_hadith_verse_finder:**
- URL: https://github.com/moinul-hossain-dhrubo/quran_hadith_verse_finder
- Flask query-based retrieval across both corpora

**fawazahmed0/quran-hadith-search:**
- URL: https://github.com/fawazahmed0/quran-hadith-search
- Keyword-based search engine across both corpora

---

### 13D. Ontology-Based Linking

**Linking Quran and Hadith Topics (RQHT):**
- Paper: [Linking Quran and Hadith Topics in an Ontology using Word Embeddings (ICNLSP 2024)](https://aclanthology.org/2024.icnlsp-1.46/)
- Result: **91% F1 score, 84% accuracy** linking Quran and Hadith topics
- Method: BERT word embeddings + Cellfie plugin for ontology population
- Produces: RQHT ontology mapping QAC concepts → Hadith topics

**Towards a Joint Ontology of Quran and Hadith:**
- Paper: https://www.researchgate.net/publication/349807453
- 51 classes, 168,122 individuals in Arabic and English
- Merges hadith ontology with Quranic ontology

**seelenbrecher/islamic-agent (Ontology-Guided Graph RAG):**
- URL: https://github.com/seelenbrecher/islamic-agent
- Approach: Ontology-guided graph traversal for verse retrieval
- Contains: `ontology.json` (all ~285 concepts with verse lists), `verses.json`, `verses_with_context.json`

---

### 13E. Academic Papers on the Linking Problem

| Paper | Year | Key Contribution |
|-------|------|-----------------|
| [Challenging Transformer Models: Quran and Hadith](https://aclanthology.org/2022.lrec-1.157/) | 2022 | Created 310-pair QH dataset, benchmarked BERT/GPT |
| [AI for Understanding Hadith (PhD Thesis)](https://etheses.whiterose.ac.uk/id/eprint/32802/1/Altammami_SH_Computing_PhD_2023.pdf) | 2023 | Framework for creating Quran-Hadith pairs from Fatwa archives |
| [SemanticHadith KG (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S1570826823000264) | 2023 | RDF knowledge graph of 6 hadith collections |
| [Linking Quran and Hadith Topics (ICNLSP)](https://aclanthology.org/2024.icnlsp-1.46/) | 2024 | 91% F1 linking topics via word embeddings |
| [Joint Ontology of Quran and Hadith](https://www.researchgate.net/publication/349807453) | 2021 | Unified ontology: 51 classes, 168K individuals |
| [RAG for Quranic/Hadith Content](https://aclanthology.org/2025.arabicnlp-sharedtasks.71.pdf) | 2025 | Shared task on RAG for Islamic text verification |
| [Hadith Classification (IEEE)](https://ieeexplore.ieee.org/document/8876603/) | 2019 | 120 topic categories, 96.5% accuracy (Decision Tree) |
| [Unsupervised Thematic Clustering of Hadith](https://arxiv.org/pdf/2512.16694) | 2024 | Apriori algorithm for theme discovery |
| [Topic Extraction in Islamic Studies (EMNLP)](https://aclanthology.org/2024.findings-emnlp.534.pdf) | 2024 | Modern NLP topic extraction |
| [Embedding Search for Quranic Texts](https://iajit.org/upload/files/Embedding-Search-for-Quranic-Texts-based-on-Large-Language-Models.pdf) | 2024 | LLM embeddings for Quranic verse retrieval |

---

### 13F. Practical Strategies for Building the Bridge

**Strategy 1 — Parse SemanticHadith V2 KG (Highest Value)**
Download `SemanticHadithKGV2.ttl.zip`, parse the Turtle RDF to extract per-hadith:
- Topic tags (`discussesTopic`)
- Quran verse references (`containsMentionOfVerse`)
- Named entities (`containsMentionOf`)
Map these to QAC ontology concepts for verse-to-hadith links.

**Strategy 2 — Parse Ibn Kathir Tafsir (Already Bundled)**
We already have Ibn Kathir tafsir in `data/tafsirs/`. It systematically cites hadiths per verse. Extract hadith references from tafsir prose via regex/NLP.

**Strategy 3 — Parse Quran Citations from Hadiths**
Many hadiths directly quote Quran. Substring-match hadith text against the Quran corpus to build reverse mappings.

**Strategy 4 — Embed-and-Match (Semantic Search)**
Generate embeddings for all verses (using English translations) + all hadiths. Compute cosine similarity, threshold to create a static mapping file.

**Strategy 5 — Use Book/Chapter Names as Coarse Topics**
Our existing bundled hadith data has `bookName` per hadith (97 Bukhari books, 56 Muslim books, etc.). These are already a coarse topic taxonomy that maps to Islamic jurisprudential categories.

**Strategy 6 — Combine All Approaches**
Use Strategy 2 + 3 for high-confidence pairs, Strategy 1 for structured topic links, Strategy 4 for similarity scores, and Strategy 5 as a fallback.

---

## 14. Semantic Search Implementation

### 14A. Embedding Models for Islamic Text

| Model | Dimensions | Languages | Arabic Quality | Access | Cost |
|-------|-----------|-----------|---------------|--------|------|
| OpenAI text-embedding-3-small | 1536 (or 512) | 100+ | Good | API | $0.02/1M tokens |
| OpenAI text-embedding-3-large | 3072 (configurable) | 100+ | Very Good | API | $0.13/1M tokens |
| Cohere embed-v4 | 1024 | 100+ | 62.3 MTEB | API | $0.10/1M tokens |
| Voyage voyage-3-large | 1024 | 62 | Strong multilingual | API | $0.06/1M tokens |
| BAAI/bge-m3 | 1024 | 100+ | Strong | Open-source | Free |
| all-MiniLM-L6-v2 | 384 | English-only | N/A | Open-source/browser | Free |
| Xenova/multilingual-e5-small | 384 | 100+ | Moderate | Open-source/browser | Free |
| Arabic Matryoshka models | Variable | Arabic-focused | High | HuggingFace | Free |

**For our use case** (English hadith text + English Quran translations): `all-MiniLM-L6-v2` (384 dims) is sufficient and runs in-browser via Transformers.js. For Arabic matching: step up to `bge-m3` or `multilingual-e5-small`.

---

### 14B. Vector Search Libraries (Compatible with Next.js)

**Client-Side / Zero Infrastructure:**

| Library | Vector Support | Size | Key Feature |
|---------|---------------|------|-------------|
| [Orama](https://github.com/oramasearch/orama) | Yes (hybrid) | <2KB | BM25 + vector search, runs in browser/Node/edge |
| [Transformers.js](https://huggingface.co/docs/transformers.js) | Manual cosine | ~23MB model | Run embedding models in-browser |
| [SemanticFinder](https://github.com/do-me/SemanticFinder) | Yes | Reference impl | Fully client-side semantic search demo |

**Server-Side (Node.js, no external services):**

| Library | Key Feature |
|---------|-------------|
| [Vectra](https://github.com/Stevenic/vectra) | JSON file index, in-memory queries, Pinecone-compatible API |
| [VectorDB.js](https://vectordbjs.themaximalist.com/) | Simple in-memory vector DB for Node.js |

**Managed (if we outgrow local):**

| Service | Key Feature |
|---------|-------------|
| Supabase pgvector | PostgreSQL extension (fits our Drizzle + pg stack) |
| Pinecone | Purpose-built, 100K vectors free tier |
| Upstash Vector | Serverless, REST API, Vercel-friendly |

---

### 14C. Recommended Implementation Path

**Phase 1 — Concept-Based Linking (No ML needed)**
1. Bundle `ontology.json` from seelenbrecher/islamic-agent (~285 concepts with verse lists)
2. Parse SemanticHadith V2 KG for per-hadith topic tags and verse references
3. Map hadith topics → QAC concepts for structured verse-hadith links
4. Use existing `bookName` from bundled hadith data as fallback topic taxonomy

**Phase 2 — Pre-computed Embeddings + Hybrid Search**
1. Write `scripts/generate-embeddings.ts` to process all verse translations + hadith texts
2. Use OpenAI `text-embedding-3-small` (384 dims) — one-time cost ~$0.10
3. Store as static JSON: `data/embeddings/verse-embeddings.json`, `data/embeddings/hadith-embeddings.json`
4. Load into Orama for hybrid keyword + vector search at runtime
5. Expose `getRelatedHadiths(verseKey: string, limit: number)` port

**Phase 3 — Tafsir-Based Extraction**
1. Parse bundled Ibn Kathir tafsir for hadith citations
2. Build high-confidence verse-hadith pairs from scholarly cross-references
3. Combine with embedding similarity scores for a quality-ranked mapping

**Storage estimates for pre-computed embeddings:**
- 384 dims × 30K texts × 4 bytes = ~46MB (Float32), ~23MB (Float16), ~12MB (Int8)

---

### 14D. Web Platforms with Cross-Referencing (Not Downloadable)

- **[QuranX.com](https://quranx.com/)** — Shows hadiths alongside Quran content (data not downloadable)
- **[Tebyin](https://tebyin.github.io/)** — Research platform for verse/tafsir/hadith cross-referencing
- **[al-hadees.com](https://al-hadees.com/)** — Search engine: 27 translations, 11 tafaseer, 21 hadith books
- **[IslamiCity](https://www.islamicity.org/quransearch/)** — Topic/word/phrase search across Quran texts

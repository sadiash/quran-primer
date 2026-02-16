#!/usr/bin/env python3
"""
Download meeAtif/hadith_datasets from HuggingFace and convert to our
data/hadith/ structure.

Source: https://huggingface.co/datasets/meeAtif/hadith_datasets
License: MIT
Fields: Book, Chapter_Number, Chapter_Title_Arabic, Chapter_Title_English,
        Arabic_Text, English_Text, Grade, Reference, In-book_reference

Output structure:
  data/hadith/index.json
  data/hadith/{collection_id}/{book_number}.json

Each book JSON:
  {
    "collection": "bukhari",
    "collectionName": "Sahih al-Bukhari",
    "book": 1,
    "bookName": "Revelation",
    "hadiths": [
      {
        "id": 1,
        "hadithNumber": "1",
        "text": "...",
        "grade": "Sahih (Darussalam)",
        "narratedBy": null,
        "reference": "https://sunnah.com/bukhari:1",
        "inBookReference": "Book 1, Hadith 1"
      }
    ]
  }

Note: Arabic text and Arabic book names are available in the source
dataset but omitted to reduce bundle size (~54MB -> ~20MB).
"""

import json
import os
import re
import shutil
import sys
import tempfile
import urllib.request
from collections import defaultdict

PARQUET_URL = "https://huggingface.co/api/datasets/meeAtif/hadith_datasets/parquet/default/train/0.parquet"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "hadith")

# Map HuggingFace "Book" names to our collection slugs
COLLECTION_MAP = {
    "Sahih al-Bukhari": ("bukhari", "Sahih al-Bukhari"),
    "Sahih Muslim": ("muslim", "Sahih Muslim"),
    "Sunan Abu Dawud": ("abudawud", "Sunan Abu Dawud"),
    "Jami` at-Tirmidhi": ("tirmidhi", "Jami at-Tirmidhi"),
    "Sunan an-Nasa'i": ("nasai", "Sunan an-Nasa'i"),
    "Sunan Ibn Majah": ("ibnmajah", "Sunan Ibn Majah"),
}

# Also handle slight variations in naming
COLLECTION_MAP_ALT = {
    "Jami' at-Tirmidhi": ("tirmidhi", "Jami at-Tirmidhi"),
    "Jami at-Tirmidhi": ("tirmidhi", "Jami at-Tirmidhi"),
    "Sunan an-Nasai": ("nasai", "Sunan an-Nasa'i"),
}


def download_parquet(dest_path):
    """Download the parquet file from HuggingFace."""
    print(f"Downloading parquet from {PARQUET_URL}...")
    urllib.request.urlretrieve(PARQUET_URL, dest_path)
    size_mb = os.path.getsize(dest_path) / (1024 * 1024)
    print(f"Downloaded {size_mb:.1f} MB")


def read_parquet(parquet_path):
    """Read parquet into list of dicts using pyarrow."""
    import pyarrow.parquet as pq

    table = pq.read_table(parquet_path)
    rows = []
    cols = table.column_names
    for i in range(table.num_rows):
        row = {}
        for col in cols:
            val = table.column(col)[i].as_py()
            row[col] = val
        rows.append(row)
    return rows


def resolve_collection(book_name):
    """Resolve a HuggingFace 'Book' value to (slug, display_name)."""
    if book_name in COLLECTION_MAP:
        return COLLECTION_MAP[book_name]
    if book_name in COLLECTION_MAP_ALT:
        return COLLECTION_MAP_ALT[book_name]
    # Fuzzy fallback
    lower = book_name.lower()
    if "bukhari" in lower:
        return ("bukhari", "Sahih al-Bukhari")
    if "muslim" in lower:
        return ("muslim", "Sahih Muslim")
    if "dawud" in lower or "abu dawud" in lower:
        return ("abudawud", "Sunan Abu Dawud")
    if "tirmidhi" in lower:
        return ("tirmidhi", "Jami at-Tirmidhi")
    if "nasa" in lower:
        return ("nasai", "Sunan an-Nasa'i")
    if "majah" in lower:
        return ("ibnmajah", "Sunan Ibn Majah")
    # Unknown — use sanitized name
    slug = re.sub(r"[^a-z0-9]", "", lower)
    return (slug, book_name)


def extract_narrator(english_text):
    """Try to extract narrator prefix from English text."""
    if not english_text:
        return None
    # Common patterns: "Narrated X:" or "It was narrated from X that"
    m = re.match(r"^((?:It was )?[Nn]arrated (?:from |by |that )?[^:]{3,80}:)", english_text)
    if m:
        return m.group(1).strip()
    return None


def extract_hadith_number(reference, in_book_ref):
    """Extract hadith number from reference URL or in-book reference."""
    if reference:
        # e.g. "https://sunnah.com/bukhari:123" -> "123"
        m = re.search(r":(\d+)$", reference)
        if m:
            return m.group(1)
    if in_book_ref:
        # e.g. "Book 1, Hadith 42" -> "42"
        m = re.search(r"Hadith\s+(\d+)", in_book_ref)
        if m:
            return m.group(1)
    return None


def convert(rows):
    """Convert flat rows into our per-book structure."""
    # Group by (collection_slug, chapter_number)
    books = defaultdict(lambda: {
        "collection": None,
        "collectionName": None,
        "book": None,
        "bookName": None,
        "bookNameArabic": None,
        "hadiths": [],
    })

    collection_stats = defaultdict(lambda: {"hadith_count": 0, "chapters": set()})
    unknown_books = set()

    for row in rows:
        book_name = row.get("Book", "")
        slug, display_name = resolve_collection(book_name)

        chapter_num = row.get("Chapter_Number", 0)
        chapter_title_en = row.get("Chapter_Title_English", "")
        chapter_title_ar = row.get("Chapter_Title_Arabic", "")
        arabic_text = row.get("Arabic_Text", "")
        english_text = row.get("English_Text", "")
        grade = row.get("Grade", None)
        reference = row.get("Reference", "")
        in_book_ref = row.get("In-book reference", "") or row.get("In-book_reference", "")

        key = (slug, chapter_num)
        book_data = books[key]
        book_data["collection"] = slug
        book_data["collectionName"] = display_name
        book_data["book"] = chapter_num
        book_data["bookName"] = chapter_title_en
        # bookNameArabic omitted to reduce bundle size

        hadith_number = extract_hadith_number(reference, in_book_ref)
        narrator = extract_narrator(english_text)

        # Clean grade
        if grade and grade.strip():
            grade = grade.strip()
        else:
            grade = None

        hadith_entry = {
            "id": len(book_data["hadiths"]) + 1,
            "hadithNumber": hadith_number or str(len(book_data["hadiths"]) + 1),
            "text": english_text or "",
            "grade": grade,
            "narratedBy": narrator,
            "reference": reference or None,
            "inBookReference": in_book_ref or None,
        }
        book_data["hadiths"].append(hadith_entry)

        collection_stats[slug]["hadith_count"] += 1
        collection_stats[slug]["chapters"].add(chapter_num)
        collection_stats[slug]["name"] = display_name

    return books, collection_stats


def write_output(books, collection_stats):
    """Write the converted data to data/hadith/."""
    # Clear old data
    if os.path.exists(OUTPUT_DIR):
        print(f"Removing old data at {OUTPUT_DIR}...")
        shutil.rmtree(OUTPUT_DIR)

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Write per-collection book files
    for (slug, chapter_num), book_data in sorted(books.items()):
        col_dir = os.path.join(OUTPUT_DIR, slug)
        os.makedirs(col_dir, exist_ok=True)

        filename = f"{chapter_num:03d}.json"
        filepath = os.path.join(col_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(book_data, f, ensure_ascii=False)

    # Write index.json
    index = []
    for slug in sorted(collection_stats.keys()):
        stats = collection_stats[slug]
        index.append({
            "id": slug,
            "name": stats["name"],
            "hadithCount": stats["hadith_count"],
            "chapterCount": len(stats["chapters"]),
        })

    with open(os.path.join(OUTPUT_DIR, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    return index


def print_summary(index, books):
    """Print summary statistics."""
    print("\n=== Hadith Dataset Summary ===")
    total = 0
    for col in index:
        print(f"  {col['name']:25s}  {col['hadithCount']:>6,} hadiths  {col['chapterCount']:>3} books")
        total += col["hadithCount"]
    print(f"  {'TOTAL':25s}  {total:>6,} hadiths")

    # Grade coverage
    graded = 0
    grades = set()
    for book_data in books.values():
        for h in book_data["hadiths"]:
            if h["grade"]:
                graded += 1
                grades.add(h["grade"])
    print(f"\n  Grade coverage: {graded:,}/{total:,} ({100*graded/total:.1f}%)")
    print(f"  Unique grades: {len(grades)}")

    # Show grade distribution (top 10)
    grade_counts = defaultdict(int)
    for book_data in books.values():
        for h in book_data["hadiths"]:
            if h["grade"]:
                grade_counts[h["grade"]] += 1
    print("\n  Top grades:")
    for grade, count in sorted(grade_counts.items(), key=lambda x: -x[1])[:15]:
        print(f"    {grade:40s}  {count:>5,}")


def main():
    # Download parquet to temp file
    with tempfile.NamedTemporaryFile(suffix=".parquet", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        download_parquet(tmp_path)
        print("Reading parquet file...")
        rows = read_parquet(tmp_path)
        print(f"Read {len(rows):,} rows")

        print("Converting to book structure...")
        books, collection_stats = convert(rows)

        print("Writing output files...")
        index = write_output(books, collection_stats)

        print_summary(index, books)
        print(f"\nDone! Output written to {OUTPUT_DIR}")

    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


if __name__ == "__main__":
    main()

/**
 * Parse SemanticHadithKGV2.ttl and extract derived JSON files.
 *
 * Usage: npx tsx scripts/parse-semantic-hadith.ts
 *
 * Outputs:
 *   data/ontology/semantic-hadith/hadith-topics.json   — hadithId → topic tags
 *   data/ontology/semantic-hadith/hadith-verses.json   — verseKey → hadithIds
 *   data/ontology/semantic-hadith/hadith-entities.json  — hadithId → entity names
 *   data/ontology/semantic-hadith/topics.json           — topic hierarchy with counts
 */

import * as fs from "fs";
import * as path from "path";
import { Parser, type Quad } from "n3";

const INPUT = path.join(
  process.cwd(),
  "data/ontology/semantic-hadith/SemanticHadithKGV2.ttl",
);
const OUT_DIR = path.join(process.cwd(), "data/ontology/semantic-hadith");

const ONTOLOGY_NS = "http://www.semantichadith.com/ontology/";

// ── Helpers ──────────────────────────────────────────────────────────

/** Strip the ontology namespace prefix from a URI, e.g. ":SB-HD0402" → "SB-HD0402" */
function localName(uri: string): string {
  if (uri.startsWith(ONTOLOGY_NS)) return uri.slice(ONTOLOGY_NS.length);
  // Handle other prefixed forms
  const hash = uri.lastIndexOf("#");
  if (hash !== -1) return uri.slice(hash + 1);
  const slash = uri.lastIndexOf("/");
  if (slash !== -1) return uri.slice(slash + 1);
  return uri;
}

/** Convert CH002_V125 → "2:125" */
function chapterVerseToKey(ref: string): string | null {
  const match = ref.match(/^CH(\d+)_V(\d+)$/);
  if (!match) return null;
  return `${Number(match[1])}:${Number(match[2])}`;
}

/** Check if a local name looks like a hadith ID (e.g. SB-HD0402, IM-HD0001) */
function isHadithId(name: string): boolean {
  return /^[A-Z]{2}-HD\d+$/.test(name);
}

/** Check if a local name looks like a verse ref (e.g. CH002_V125) */
function isVerseRef(name: string): boolean {
  return /^CH\d+_V\d+$/.test(name);
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("Reading TTL file...");
  const ttl = fs.readFileSync(INPUT, "utf-8");

  console.log("Parsing triples...");
  const quads = await parseAll(ttl);
  console.log(`  Parsed ${quads.length} triples`);

  // Accumulators
  const hadithTopics = new Map<string, Set<string>>(); // hadithId → Set<topicName>
  const verseToHadiths = new Map<string, Set<string>>(); // verseKey → Set<hadithId>
  const hadithEntities = new Map<string, Set<string>>(); // hadithId → Set<entityName>
  const topicSubTopics = new Map<string, Set<string>>(); // topicName → Set<subTopicName>
  const topicHadiths = new Map<string, Set<string>>(); // topicName → Set<hadithId>

  for (const quad of quads) {
    const pred = localName(quad.predicate.value);
    const subj = localName(quad.subject.value);
    const obj = localName(quad.object.value);

    switch (pred) {
      case "discussesTopic": {
        // Hadith → Topic
        if (isHadithId(subj)) {
          if (!hadithTopics.has(subj)) hadithTopics.set(subj, new Set());
          hadithTopics.get(subj)!.add(obj);

          if (!topicHadiths.has(obj)) topicHadiths.set(obj, new Set());
          topicHadiths.get(obj)!.add(subj);
        }
        break;
      }

      case "discussedIn": {
        // Topic → Hadith (inverse of discussesTopic)
        if (isHadithId(obj)) {
          if (!hadithTopics.has(obj)) hadithTopics.set(obj, new Set());
          hadithTopics.get(obj)!.add(subj);

          if (!topicHadiths.has(subj)) topicHadiths.set(subj, new Set());
          topicHadiths.get(subj)!.add(obj);
        }
        break;
      }

      case "containsMentionOfVerse": {
        // Hadith → Verse
        if (isHadithId(subj) && isVerseRef(obj)) {
          const verseKey = chapterVerseToKey(obj);
          if (verseKey) {
            if (!verseToHadiths.has(verseKey))
              verseToHadiths.set(verseKey, new Set());
            verseToHadiths.get(verseKey)!.add(subj);
          }
        }
        break;
      }

      case "containsMentionOf": {
        // Hadith → Entity (but NOT verse refs — those use containsMentionOfVerse)
        if (isHadithId(subj) && !isVerseRef(obj) && !isHadithId(obj)) {
          if (!hadithEntities.has(subj))
            hadithEntities.set(subj, new Set());
          hadithEntities.get(subj)!.add(obj);
        }
        break;
      }

      case "hasSubTopic": {
        if (!topicSubTopics.has(subj))
          topicSubTopics.set(subj, new Set());
        topicSubTopics.get(subj)!.add(obj);
        break;
      }
    }
  }

  // ── Write outputs ──────────────────────────────────────────────────

  fs.mkdirSync(OUT_DIR, { recursive: true });

  // 1. hadith-topics.json: { hadithId: [topic1, topic2, ...] }
  const hadithTopicsObj: Record<string, string[]> = {};
  for (const [id, topics] of hadithTopics) {
    hadithTopicsObj[id] = [...topics].sort();
  }
  const hadithTopicsPath = path.join(OUT_DIR, "hadith-topics.json");
  fs.writeFileSync(hadithTopicsPath, JSON.stringify(hadithTopicsObj, null, 2));
  console.log(
    `  hadith-topics.json: ${Object.keys(hadithTopicsObj).length} hadiths with topic tags`,
  );

  // 2. hadith-verses.json: { verseKey: [hadithId1, hadithId2, ...] }
  const hadithVersesObj: Record<string, string[]> = {};
  for (const [key, ids] of verseToHadiths) {
    hadithVersesObj[key] = [...ids].sort();
  }
  const hadithVersesPath = path.join(OUT_DIR, "hadith-verses.json");
  fs.writeFileSync(hadithVersesPath, JSON.stringify(hadithVersesObj, null, 2));
  console.log(
    `  hadith-verses.json: ${Object.keys(hadithVersesObj).length} verses with linked hadiths`,
  );

  // 3. hadith-entities.json: { hadithId: [entity1, entity2, ...] }
  const hadithEntitiesObj: Record<string, string[]> = {};
  for (const [id, entities] of hadithEntities) {
    hadithEntitiesObj[id] = [...entities].sort();
  }
  const hadithEntitiesPath = path.join(OUT_DIR, "hadith-entities.json");
  fs.writeFileSync(
    hadithEntitiesPath,
    JSON.stringify(hadithEntitiesObj, null, 2),
  );
  console.log(
    `  hadith-entities.json: ${Object.keys(hadithEntitiesObj).length} hadiths with entity mentions`,
  );

  // 4. topics.json: { topicName: { subTopics: [...], hadithCount: N } }
  // Collect all topic names (from sub-topic hierarchy + topics with hadiths)
  const allTopicNames = new Set([
    ...topicSubTopics.keys(),
    ...topicHadiths.keys(),
  ]);
  const topicsObj: Record<string, { subTopics: string[]; hadithCount: number }> =
    {};
  for (const name of [...allTopicNames].sort()) {
    topicsObj[name] = {
      subTopics: [...(topicSubTopics.get(name) ?? [])].sort(),
      hadithCount: topicHadiths.get(name)?.size ?? 0,
    };
  }
  const topicsPath = path.join(OUT_DIR, "topics.json");
  fs.writeFileSync(topicsPath, JSON.stringify(topicsObj, null, 2));
  console.log(
    `  topics.json: ${Object.keys(topicsObj).length} topics`,
  );

  console.log("\nDone!");
}

function parseAll(input: string): Promise<Quad[]> {
  return new Promise((resolve, reject) => {
    const parser = new Parser();
    const quads: Quad[] = [];
    parser.parse(input, (error, quad) => {
      if (error) {
        reject(error);
        return;
      }
      if (quad) {
        quads.push(quad);
      } else {
        resolve(quads);
      }
    });
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

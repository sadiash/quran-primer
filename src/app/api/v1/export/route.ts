import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * POST /api/v1/export
 * Writes backup JSON to ~/Desktop and returns the path.
 */
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const raw = formData.get("payload");

  if (typeof raw !== "string") {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const data = JSON.parse(raw);
  const json = JSON.stringify(data, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `the-primer-backup-${date}.json`;
  const filepath = join(homedir(), "Desktop", filename);

  await writeFile(filepath, json, "utf-8");

  return NextResponse.json({ ok: true, path: filepath, filename });
}

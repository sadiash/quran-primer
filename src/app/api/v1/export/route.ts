import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/export
 * Returns backup JSON as a downloadable file response.
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

  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

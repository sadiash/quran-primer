import { NextRequest, NextResponse } from "next/server";
import { badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { createLogger } from "@/infrastructure/logging";

const log = createLogger({ module: "api:export" });

/**
 * POST /api/v1/export
 * Returns backup JSON as a downloadable file response.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const raw = formData.get("payload");

    if (typeof raw !== "string") {
      return toResponse(badRequest("Missing payload field"));
    }

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return toResponse(badRequest("Invalid JSON in payload"));
    }

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
  } catch (e) {
    log.error({ err: e }, "Export failed");
    return toResponse(serverError());
  }
}

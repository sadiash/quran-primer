import { ok, toResponse } from "@/lib/api-helpers";

export async function GET() {
  return toResponse(
    ok({
      status: "ok",
      timestamp: new Date().toISOString(),
    }),
  );
}

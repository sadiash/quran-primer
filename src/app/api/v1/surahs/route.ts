import { ok, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";

const log = createLogger({ module: "api:surahs" });

export async function GET() {
  try {
    const surahs = await getQuranService().getAllSurahs();
    return toResponse(ok(surahs, { total: surahs.length }));
  } catch (error) {
    log.error({ error }, "Failed to fetch surahs");
    return toResponse(serverError());
  }
}

import { ok, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";

const log = createLogger({ module: "api:tafsirs" });

export async function GET() {
  try {
    const tafsirs = await getQuranService().getAvailableTafsirs();
    return toResponse(ok(tafsirs, { total: tafsirs.length }));
  } catch (error) {
    log.error({ error }, "Failed to fetch tafsirs");
    return toResponse(serverError());
  }
}

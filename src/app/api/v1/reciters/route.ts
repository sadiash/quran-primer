import { ok, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";

const log = createLogger({ module: "api:reciters" });

export async function GET() {
  try {
    const reciters = await getQuranService().getReciters();
    return toResponse(ok(reciters, { total: reciters.length }));
  } catch (error) {
    log.error({ error }, "Failed to fetch reciters");
    return toResponse(serverError());
  }
}

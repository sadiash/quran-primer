import { ok, serverError, toResponse } from "@/lib/api-helpers";
import { getQuranService } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";

const log = createLogger({ module: "api:translations" });

export async function GET() {
  try {
    const translations = await getQuranService().getAvailableTranslations();
    return toResponse(ok(translations, { total: translations.length }));
  } catch (error) {
    log.error({ error }, "Failed to fetch available translations");
    return toResponse(serverError());
  }
}

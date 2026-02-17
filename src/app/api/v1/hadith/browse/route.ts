import { ok, badRequest, serverError, toResponse } from "@/lib/api-helpers";
import { getHadithAdapter } from "@/lib/services";
import { createLogger } from "@/infrastructure/logging";
import type { NextRequest } from "next/server";

const log = createLogger({ module: "api:hadith:browse" });

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const collection = url.searchParams.get("collection");
    const book = url.searchParams.get("book");

    if (!collection) {
      return toResponse(badRequest("collection parameter is required"));
    }

    const adapter = getHadithAdapter();

    if (book) {
      const bookNum = parseInt(book, 10);
      if (isNaN(bookNum)) {
        return toResponse(badRequest("book must be a number"));
      }
      const hadiths = await adapter.browseHadiths(collection, bookNum);
      return toResponse(ok(hadiths, { total: hadiths.length }));
    }

    const books = await adapter.browseBooks(collection);
    return toResponse(ok(books, { total: books.length }));
  } catch (error) {
    log.error({ error }, "Hadith browse failed");
    return toResponse(serverError());
  }
}

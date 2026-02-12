/** API response helpers for consistent envelope formatting */

import type { ApiResponse, ApiMeta, ApiError } from "@/core/types";

export function ok<T>(data: T, meta?: ApiMeta): ApiResponse<T> {
  return { ok: true, data, ...(meta && { meta }) };
}

export function err(code: string, message: string, details?: unknown): ApiError {
  const error: ApiError["error"] = { code, message };
  if (details !== undefined) error.details = details;
  return { ok: false, error };
}

export function notFound(message = "Resource not found"): ApiError {
  return err("NOT_FOUND", message);
}

export function badRequest(message: string, details?: unknown): ApiError {
  return err("BAD_REQUEST", message, details);
}

export function serverError(
  message = "Internal server error",
  details?: unknown,
): ApiError {
  return err("INTERNAL_ERROR", message, details);
}

/** Convert ApiResponse to a Next.js Response */
export function toResponse<T>(result: ApiResponse<T>): Response {
  const status = result.ok ? 200 : getStatusCode(result.error.code);
  return Response.json(result, { status });
}

function getStatusCode(code: string): number {
  switch (code) {
    case "NOT_FOUND":
      return 404;
    case "BAD_REQUEST":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN":
      return 403;
    case "INTERNAL_ERROR":
      return 500;
    default:
      return 500;
  }
}

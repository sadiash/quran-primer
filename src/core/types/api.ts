/** API envelope types for consistent request/response shapes */

export interface ApiSuccess<T> {
  ok: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  cached?: boolean;
}

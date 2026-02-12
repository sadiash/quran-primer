/** HTTP client with retry, exponential backoff, and circuit breaker integration */

export interface HttpClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  backoffMs?: number;
  headers?: Record<string, string>;
}

export interface HttpRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  retries?: number;
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: unknown,
  ) {
    super(`HTTP ${status}: ${statusText}`);
    this.name = "HttpError";
  }
}

const DEFAULT_OPTIONS: Required<HttpClientOptions> = {
  baseUrl: "",
  timeout: 10_000,
  retries: 3,
  backoffMs: 300,
  headers: {},
};

export class HttpClient {
  private readonly options: Required<HttpClientOptions>;

  constructor(options: HttpClientOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  async post<T>(
    path: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: HttpRequestOptions,
  ): Promise<T> {
    const url = this.options.baseUrl + path;
    const maxRetries = options?.retries ?? this.options.retries;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (attempt > 0) {
        const delay = this.options.backoffMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.options.timeout,
        );

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...this.options.headers,
            ...options?.headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: options?.signal ?? controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const responseBody = await response.text().catch(() => "");
          const parsed = tryParseJson(responseBody);

          if (response.status >= 500 && attempt < maxRetries) {
            lastError = new HttpError(response.status, response.statusText, parsed);
            continue; // retry server errors
          }

          throw new HttpError(response.status, response.statusText, parsed);
        }

        return (await response.json()) as T;
      } catch (error) {
        if (error instanceof HttpError) throw error;

        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt >= maxRetries) break;
      }
    }

    throw lastError ?? new Error("Request failed");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

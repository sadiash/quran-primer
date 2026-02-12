/** Three-state circuit breaker: CLOSED → OPEN → HALF_OPEN */

export type CircuitState = "closed" | "open" | "half_open";

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
  halfOpenMaxAttempts?: number;
}

const DEFAULTS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  resetTimeoutMs: 30_000,
  halfOpenMaxAttempts: 1,
};

export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private halfOpenAttempts = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(options: CircuitBreakerOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
  }

  getState(): CircuitState {
    this.checkStateTransition();
    return this.state;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.checkStateTransition();

    if (this.state === "open") {
      throw new CircuitOpenError();
    }

    if (this.state === "half_open") {
      this.halfOpenAttempts++;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.halfOpenAttempts = 0;
    this.lastFailureTime = 0;
  }

  private onSuccess(): void {
    if (this.state === "half_open") {
      this.reset();
    }
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === "half_open") {
      this.state = "open";
      return;
    }

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "open";
    }
  }

  private checkStateTransition(): void {
    if (this.state !== "open") return;

    const elapsed = Date.now() - this.lastFailureTime;
    if (elapsed >= this.options.resetTimeoutMs) {
      this.state = "half_open";
      this.halfOpenAttempts = 0;
    }
  }
}

export class CircuitOpenError extends Error {
  constructor() {
    super("Circuit breaker is open — requests are blocked");
    this.name = "CircuitOpenError";
  }
}

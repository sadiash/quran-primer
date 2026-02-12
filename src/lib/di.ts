/** Minimal dependency injection container — typed, singleton-scoped */

type Factory<T> = () => T;

export class Container {
  private readonly singletons = new Map<string, unknown>();
  private readonly factories = new Map<string, Factory<unknown>>();

  /** Register a singleton factory. Instance is created lazily on first resolve. */
  register<T>(token: string, factory: Factory<T>): void {
    this.factories.set(token, factory);
    this.singletons.delete(token); // clear stale singleton if re-registering
  }

  /** Resolve a registered dependency. Creates once, returns cached thereafter. */
  resolve<T>(token: string): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`DI: No registration found for "${token}"`);
    }

    const instance = factory();
    this.singletons.set(token, instance);
    return instance as T;
  }

  /** Check if a token is registered */
  has(token: string): boolean {
    return this.factories.has(token);
  }

  /** Clear all registrations (useful in tests) */
  clear(): void {
    this.singletons.clear();
    this.factories.clear();
  }
}

/** Global app container */
export const container = new Container();

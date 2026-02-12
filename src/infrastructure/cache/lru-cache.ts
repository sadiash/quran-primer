/** LRU cache with TTL eviction */

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

export interface LruCacheOptions {
  maxSize?: number;
  ttlMs?: number;
}

const DEFAULTS: Required<LruCacheOptions> = {
  maxSize: 100,
  ttlMs: 5 * 60 * 1000, // 5 minutes
};

export class LruCache<V> {
  private readonly cache = new Map<string, CacheEntry<V>>();
  private readonly options: Required<LruCacheOptions>;

  constructor(options: LruCacheOptions = {}) {
    this.options = { ...DEFAULTS, ...options };
  }

  get(key: string): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: V, ttlMs?: number): void {
    // Delete first so re-insert moves to end
    this.cache.delete(key);

    // Evict oldest if at capacity
    if (this.cache.size >= this.options.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.options.ttlMs),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

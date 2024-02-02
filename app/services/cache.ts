import type { SearchResult } from '~/types';

interface CacheEntry {
  searchResults: SearchResult[];
  summary: string;
}

class InMemoryCache {
  private cache: Map<string, CacheEntry>;

  constructor() {
    this.cache = new Map<string, CacheEntry>();
  }

  set(key: string, value: CacheEntry): void {
    this.cache.set(key, value);
  }

  get(key: string): CacheEntry | undefined {
    return this.cache.get(key);
  }

  getAll(): Map<string, CacheEntry> {
    return this.cache;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

export const cache = new InMemoryCache();

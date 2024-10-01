import Dexie from 'dexie';

// Define the structure of your caches
export interface CacheItem<T> {
  key: string;
  value: T;
  timestamp: number;
}

// Create and manage multiple caches
class CacheDatabase extends Dexie {
  public dataCache: Dexie.Table<CacheItem<any>, string>; // Generic cache for any data type
  public mangaCache: Dexie.Table<CacheItem<any>, string>; // Cache for images

  constructor() {
    super('MangaReaderCache');

    // Define multiple stores/caches for different data types
    this.version(1).stores({
      dataCache: 'key, timestamp',
      mangaCache: 'key, timestamp',
    });

    this.dataCache = this.table('dataCache');
    this.mangaCache = this.table('mangaCache');
  }

/**
 * Sets a cache item in the specified Dexie store.
 *
 * @template T - The type of the value to be cached.
 * @param {Dexie.Table<CacheItem<T>, string>} store - The Dexie table where the cache item will be stored.
 * @param {string} key - The key associated with the cache item.
 * @param {T} value - The value to be cached.
 * @returns {Promise<void>} A promise that resolves when the cache item has been stored.
 */
  async setCache<T>(store: Dexie.Table<CacheItem<T>, string>, key: string, value: T) {
    const cacheItem: CacheItem<T> = { key, value, timestamp: Date.now() };
    await store.put(cacheItem);
  }

/**
 * Retrieves a cached item from the specified Dexie store.
 *
 * @template T - The type of the cached item.
 * @param {Dexie.Table<CacheItem<T>, string>} store - The Dexie table where the cache is stored.
 * @param {string} key - The key of the cached item.
 * @param {number} [expirationTime] - Optional expiration time in milliseconds. If not provided, the cache is considered infinite.
 * @returns {Promise<T | null>} - A promise that resolves to the cached item if it exists and is not expired, or null otherwise.
 */
  async getCache<T>(store: Dexie.Table<CacheItem<T>, string>, key: string, expirationTime?: number): Promise<T | null> {
    const cacheItem = await store.get(key);
    if (!cacheItem) return null;

    // If no expiration time is provided, treat it as an infinite cache
    if (!expirationTime) {
      return cacheItem.value;
    }

    // If expiration time is set, check if the cache is expired
    const isExpired = Date.now() - cacheItem.timestamp > expirationTime;
    return isExpired ? null : cacheItem.value;
  }
}

// Export an instance of the database
const db = new CacheDatabase();

export default db;

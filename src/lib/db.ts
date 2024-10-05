import Dexie from "dexie";
import {
    MangaCacheItem,
    HqMangaCacheItem,
    Bookmark,
} from "@/app/api/interfaces";

// Define the structure of your caches
export interface CacheItem<T> {
    key: string;
    value: T;
    timestamp: number;
}

// Create and manage multiple caches
class CacheDatabase extends Dexie {
    public bookmarkCache: Dexie.Table<CacheItem<number | Bookmark[]>, string>;
    public mangaCache: Dexie.Table<CacheItem<MangaCacheItem>, string>;
    public hqMangaCache: Dexie.Table<CacheItem<HqMangaCacheItem>, string>;

    constructor() {
        super("MangaReaderCache");

        // Define multiple stores/caches for different data types
        this.version(1).stores({
            bookmarkCache: "key, timestamp",
            mangaCache: "key, timestamp",
            hqMangaCache: "key, timestamp",
        });

        this.bookmarkCache = this.table("bookmarkCache");
        this.mangaCache = this.table("mangaCache");
        this.hqMangaCache = this.table("hqMangaCache");
    }

    /**
     * Retrieves all values from the specified Dexie store.
     *
     * @template T - The type of the cached items.
     * @param {Dexie.Table<CacheItem<T>, string>} store - The Dexie table where the cache is stored.
     * @returns {Promise<T[]>} - A promise that resolves to an array of all cached values.
     */
    async getAllCacheValues<T>(
        store: Dexie.Table<CacheItem<T>, string>,
    ): Promise<T[]> {
        const cacheItems = await store.toArray();
        return cacheItems.map((item) => item.value);
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
    async setCache<T>(
        store: Dexie.Table<CacheItem<T>, string>,
        key: string,
        value: T,
    ): Promise<void> {
        const cacheItem: CacheItem<T> = { key, value, timestamp: Date.now() };
        await store.put(cacheItem);
    }

    /**
     * Updates a cache item in the specified Dexie store.
     *
     * @template T - The type of the value to be cached.
     * @param {Dexie.Table<CacheItem<T>, string>} store - The Dexie table where the cache item will be stored.
     * @param {string} key - The key associated with the cache item.
     * @param {Partial<T>} newValue - The new value to be merged with the existing cache item.
     * @returns {Promise<void>} A promise that resolves when the cache item has been updated.
     */
    async updateCache<T>(
        store: Dexie.Table<CacheItem<T>, string>,
        key: string,
        newValue: Partial<T>,
    ): Promise<void> {
        const existingCacheItem = await db.getCache(store, key);
        if (existingCacheItem) {
            const updatedValue = { ...existingCacheItem, ...newValue };
            await db.setCache(store, key, updatedValue);
        } else {
            await db.setCache(store, key, newValue as T);
        }
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
    async getCache<T>(
        store: Dexie.Table<CacheItem<T>, string>,
        key: string,
        expirationTime?: number,
    ): Promise<T | null> {
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

import { NextResponse } from "next/server";
import { PerformanceMetrics } from "./performance";
import { getBaseUrl } from "./base-url";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export interface ApiErrorData {
    message: string;
    details?: unknown;
}

type CacheTimeUnit = "seconds" | "minutes" | "hours" | "days";
type CacheTimeString = `${number} ${CacheTimeUnit}`;
type CacheTime = number | CacheTimeString;

export interface CreateApiResponseOptions {
    status?: number;
    isPrivate?: boolean;
    cacheTime?: CacheTime;
    setCookies?: string[];
    performance?: PerformanceMetrics;
}

export interface CreateApiErrorResponseOptions {
    status?: number;
}

/**
 * Parses a cache time string into seconds.
 * Supports formats like "1 minutes", "2 hours", etc.
 * @param timeStr - The time string to parse
 * @returns The time in seconds
 */
function parseCacheTime(timeStr: CacheTimeString): number {
    const parts = timeStr.trim().split(/\s+/);
    if (parts.length !== 2) {
        throw new Error(`Invalid cache time format: ${timeStr}`);
    }
    const value = parseFloat(parts[0]);
    if (isNaN(value)) {
        throw new Error(`Invalid number in cache time: ${timeStr}`);
    }
    const unit = parts[1].toLowerCase() as CacheTimeUnit;
    switch (unit) {
        case "seconds":
            return value;
        case "minutes":
            return value * 60;
        case "hours":
            return value * 3600;
        case "days":
            return value * 86400;
        default:
            throw new Error(`Unsupported unit in cache time: ${unit}`);
    }
}

/**
 * Generates cache control headers for different caching levels.
 * @param time - The base time in seconds for caching
 * @param staleWhileRevalidate - Time in seconds to use stale content while revalidating (defaults to time*2)
 * @param staleIfError - Time in seconds to use stale content when errors occur (defaults to time)
 * @returns An object containing cache control headers
 */
export function generateCacheHeaders(
    time: number,
    staleWhileRevalidate?: number,
    staleIfError: number = 0,
    isPrivate: boolean = false
): Array<{ key: string; value: string }> {
    const swr = staleWhileRevalidate ?? Math.round(time * 2);
    const cacheControl = `${
        isPrivate ? "private" : "public"
    }, max-age=${time}, stale-while-revalidate=${swr}, stale-if-error=${staleIfError}`;

    return [
        { key: "Cache-Control", value: cacheControl },
        { key: "CDN-Cache-Control", value: cacheControl },
    ];
}

/**
 * Creates a consistent API response for successful operations.
 * @param data - The data to return in the response body
 * @param options - Optional configuration object
 * @returns A Response object with JSON data and appropriate headers
 */
export function createApiResponse(
    data: unknown,
    options: CreateApiResponseOptions = {}
): NextResponse {
    const defaults = { status: 200 };
    const mergedOptions = { ...defaults, ...options };
    const { status, cacheTime, isPrivate } = mergedOptions;

    const headers = new Headers({
        "Content-Type": "application/json",
    });

    if (cacheTime !== undefined) {
        let cacheTimeSeconds: number;
        if (typeof cacheTime === "string") {
            cacheTimeSeconds = parseCacheTime(cacheTime);
        } else {
            cacheTimeSeconds = cacheTime;
        }
        const cacheHeaders = generateCacheHeaders(
            cacheTimeSeconds,
            undefined,
            0,
            isPrivate
        );
        cacheHeaders.forEach((header) => {
            headers.append(header.key, header.value);
        });
    }

    if (mergedOptions.setCookies) {
        mergedOptions.setCookies.forEach((cookie) => {
            headers.append("Set-Cookie", cookie);
        });
    }

    return new NextResponse(
        JSON.stringify({
            result: "success",
            status,
            data,
            performance: mergedOptions.performance || {},
        }),
        { status, headers }
    );
}

/**
 * Creates a consistent API response for error cases.
 * @param errorData - The error data to return in the response body
 * @param options - Optional configuration object
 * @returns A Response object with JSON error data and appropriate headers
 */
export function createApiErrorResponse(
    errorData: ApiErrorData,
    options: CreateApiErrorResponseOptions = {}
): NextResponse {
    const defaults = { status: 500 };
    const mergedOptions = { ...defaults, ...options };
    const { status } = mergedOptions;

    return new NextResponse(
        JSON.stringify({
            result: "error",
            status,
            data: errorData,
        }),
        {
            status,
            headers: { "Content-Type": "application/json" },
        }
    );
}

/**
 * Type guard to check if a value is of type ApiErrorData.
 * @param value - The value to check
 * @returns True if the value is ApiErrorResponse, false otherwise
 */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
    return (
        typeof value === "object" &&
        value !== null &&
        "result" in value &&
        (value as Record<string, unknown>).result === "error"
    );
}

/**
 * Type guard to check if a value is of type ApiErrorData.
 * Ensures the object has a 'message' property (string) and optionally 'details', with no other properties.
 * @param value - The value to check
 * @returns True if the value is ApiErrorData, false otherwise
 */
export function isApiErrorData(value: unknown): value is ApiErrorData {
    if (
        typeof value !== "object" ||
        value === null ||
        !("message" in value) ||
        typeof (value as Record<string, unknown>).message !== "string"
    ) {
        return false;
    }

    const keys = Object.keys(value);
    return keys.every((key) => key === "message" || key === "details");
}

export function getUsernameFromCookies(
    cookies: ReadonlyRequestCookies
): string | null {
    const token = cookies.get("token")?.value;
    if (!token) return null;
    const data = token.split(".")[1];
    if (!data) return null;
    return JSON.parse(atob(data)).user.username;
}

export interface ApiSuccessResponse<T> {
    result: "success";
    status: number;
    data: T;
    performance: PerformanceMetrics;
}

export interface ApiErrorResponse {
    result: "error";
    status: number;
    data: ApiErrorData;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

const INVALIDATED_KEYS_STORAGE_KEY = "invalidatedCacheKeys";

/**
 * Retrieves the list of invalidated cache keys from sessionStorage.
 * @returns An array of invalidated keys
 */
function getInvalidatedCacheKeys(): string[] {
    try {
        const stored = sessionStorage.getItem(INVALIDATED_KEYS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn(
            "Failed to retrieve invalidated cache keys from sessionStorage:",
            error
        );
        return [];
    }
}

/**
 * Saves the list of invalidated cache keys to sessionStorage.
 * @param keys - The array of keys to save
 */
function setInvalidatedCacheKeys(keys: string[]): void {
    try {
        sessionStorage.setItem(
            INVALIDATED_KEYS_STORAGE_KEY,
            JSON.stringify(keys)
        );
    } catch (error) {
        console.warn(
            "Failed to save invalidated cache keys to sessionStorage:",
            error
        );
    }
}

/**
 * Marks a cache key as invalidated, forcing future fetches with that key to revalidate.
 * @param key - The cache key to invalidate
 */
export function invalidateCacheKey(key: string): void {
    const keys = getInvalidatedCacheKeys();
    if (!keys.includes(key)) {
        keys.push(key);
        setInvalidatedCacheKeys(keys);
    }
}

/**
 * Marks multiple cache keys as invalidated, forcing future fetches with those keys to revalidate.
 * @param keys - The array of cache keys to invalidate
 */
export function invalidateCacheKeys(keys: string[]): void {
    const currentKeys = getInvalidatedCacheKeys();
    const newKeys = keys.filter((key) => !currentKeys.includes(key));
    if (newKeys.length > 0) {
        currentKeys.push(...newKeys);
        setInvalidatedCacheKeys(currentKeys);
    }
}

/**
 * Checks if a cache key is invalidated.
 * @param key - The cache key to check
 * @returns True if invalidated, false otherwise
 */
function isCacheKeyInvalidated(key: string): boolean {
    const keys = getInvalidatedCacheKeys();
    return keys.includes(key);
}

export interface FetchApiOptions extends RequestInit {
    cacheKey?: string;
}

type ApiVersions = "v1";
export type ApiUrl =
    | `/api/${ApiVersions}/${string}`
    | `${string}/api/${ApiVersions}/${string}`;

/**
 * Fetches data from the API and returns a properly typed response.
 * The response is either a success with data or an error with details.
 * @param url - The API endpoint URL
 * @param options - Optional fetch options
 * @returns A promise that resolves to the API response
 */
export async function fetchApi<T>(
    url: ApiUrl,
    options?: FetchApiOptions
): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith("http") ? url : `${getBaseUrl()}${url}`;

    const fetchOptions: RequestInit = { ...options };
    if (
        options &&
        options.cacheKey &&
        isCacheKeyInvalidated(options.cacheKey)
    ) {
        fetchOptions.cache = "no-cache";

        // Remove the key from invalidated list after using it
        const keys = getInvalidatedCacheKeys().filter(
            (k) => k !== options.cacheKey
        );
        setInvalidatedCacheKeys(keys);
    }

    const response = await fetch(fullUrl, fetchOptions);
    const json: unknown = await response.json();

    if (
        typeof json === "object" &&
        json !== null &&
        "result" in json &&
        (json.result === "success" || json.result === "error")
    ) {
        return json as ApiResponse<T>;
    }

    throw new Error("Invalid API response format");
}

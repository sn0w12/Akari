import { StorageValue } from "@/types/storage";
import type { SecondaryAccount } from "../secondary-accounts";
import { StorageManager, StorageWrapper } from "@/lib/storage";

/**
 * Abstract base class for secondary account implementations.
 * This class provides common functionality for managing secondary accounts,
 * including color-based text contrast calculation and cache invalidation.
 * Subclasses must implement the abstract methods to define account-specific behavior.
 */
export abstract class SecondaryAccountBase implements SecondaryAccount {
    /**
     * Unique identifier for the secondary account type.
     */
    abstract readonly id: string;

    /**
     * Display name for the secondary account.
     */
    abstract readonly name: string;

    /**
     * Hex color code associated with the secondary account (e.g., "#FF0000").
     */
    abstract readonly color: string;

    abstract readonly userStorage: StorageWrapper<{
        id: {
            readonly type: "number";
            readonly default: StorageValue;
        };
        name: {
            readonly type: "string";
            readonly default: StorageValue;
        };
    }>;

    /**
     * Calculates and returns the appropriate text color (#000000 or #FFFFFF)
     * based on the background color for optimal contrast.
     */
    get textColor(): string {
        return this.calculateTextColor(this.color);
    }

    /**
     * Calculates the text color based on the luminance of the background color.
     * @param hex - The hex color code of the background.
     * @returns "#000000" for light backgrounds, "#FFFFFF" for dark backgrounds.
     */
    private calculateTextColor(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? "#000000" : "#FFFFFF";
    }

    /**
     * Returns the authentication URL for initiating the login process for this account.
     * @returns The URL to redirect the user to for authentication.
     */
    abstract getAuthUrl(): string;

    /**
     * Logs out the user from this secondary account.
     * @returns A promise that resolves to true if logout was successful, false otherwise.
     */
    abstract logOut(): Promise<boolean>;

    /**
     * Invalidates the cached data for this account.
     * This removes any stored authentication or sync data from the cache.
     */
    public invalidate(): void {
        const cacheStorage = StorageManager.get("secondaryAccountCache");
        cacheStorage.set({ valid: false }, { accountId: this.id });
    }

    /**
     * Validates whether the current authentication for this account is still valid.
     * @returns A promise that resolves to true if the account is valid, false otherwise.
     */
    abstract validate(): Promise<boolean>;

    /**
     * Synchronizes manga reading progress with this secondary account.
     * @param manga - The chapter response containing manga data to sync.
     * @returns A promise that resolves to true if sync was successful, false otherwise.
     */
    abstract sync(
        manga: components["schemas"]["ChapterResponse"]
    ): Promise<boolean>;

    /**
     * Handles the callback from the authentication provider after login.
     * @param params - URL parameters from the callback.
     * @param hash - URL hash from the callback.
     * @param origin - The origin URL of the callback.
     * @returns A promise that resolves to true if the callback was handled successfully, false otherwise.
     */
    abstract handleCallback(
        params: Record<string, string>,
        hash: string,
        origin: string
    ): Promise<boolean>;
}

import { getSetting, setSetting } from "@/lib/settings";
import { StorageManager } from "@/lib/storage";
import type { SecondaryAccount } from "../secondary-accounts";

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

    /**
     * Storage wrapper for user data associated with this secondary account.
     */
    get userStorage() {
        return StorageManager.get("secondaryAccountUser", {
            accountId: this.id,
        });
    }

    /**
     * Storage for if this account has been activated before.
     */
    protected get activatedStorage() {
        return StorageManager.get("secondaryAccountSettingActivated", {
            accountId: this.id,
        });
    }

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
     * This method performs account-specific logout logic and then invalidates the cache.
     * @returns A promise that resolves to true if logout was successful, false otherwise.
     */
    async logOut(): Promise<boolean> {
        const result = await this.doLogOut();
        this.invalidate();
        this.userStorage.remove();
        return result;
    }

    /**
     * Abstract method for account-specific logout logic.
     * Subclasses must implement this to handle provider-specific cleanup (e.g., removing cookies).
     * @returns A promise that resolves to true if the logout logic succeeded, false otherwise.
     */
    protected abstract doLogOut(): Promise<boolean>;

    /**
     * Invalidates the cached data for this account.
     * This removes any stored authentication or sync data from the cache.
     */
    public invalidate(): void {
        const cacheStorage = StorageManager.get("secondaryAccountCache", {
            accountId: this.id,
        });
        cacheStorage.set({ valid: false });
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
        manga: components["schemas"]["ChapterResponse"],
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
        origin: string,
    ): Promise<boolean>;

    /**
     * Updates the login toast setting for the current account.
     *
     * If the account has not previously activated the login toast, this method marks it as activated
     * in persistent storage and adds the account ID to the "groupLoginToasts" setting.
     * If the account has already been activated, the method returns early and makes no changes.
     */
    updateLoginToastSetting(): void {
        const hasActivatedBefore = this.activatedStorage.get()?.activated;
        if (hasActivatedBefore) return;

        this.activatedStorage.set({ activated: true });
        setSetting("groupLoginToasts", [
            ...((getSetting("groupLoginToasts") as unknown as string[]) || []),
            this.id,
        ]);
    }
}

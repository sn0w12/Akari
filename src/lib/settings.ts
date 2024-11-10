import {
    SettingValue,
    SettingsMap,
    Setting,
} from "@/components/ui/Header/Settings";
import React from "react";
import db from "./db";

export const SETTINGS_CHANGE_EVENT = "settingsChange";
export interface SettingsChangeEvent {
    key: keyof SettingsInterface;
    value: SettingValue;
    previousValue: SettingValue;
}

type DefaultValueType<T> = T extends { default: infer D } ? D : never;

export type SettingsInterface = {
    [K in keyof typeof settings]: DefaultValueType<(typeof settings)[K]>;
};

export const generalSettings = {
    label: "General",
    fetchMalImage: {
        label: "Fetch MAL Data",
        description: "Slows down first load on manga detail pages.",
        type: "checkbox",
        default: true,
    },
    fancyAnimations: {
        label: "Fancy Animations",
        description: "Such as manga detail pages cover image.",
        type: "checkbox",
        default: true,
    },
};

export const mangaSettings = {
    label: "Manga",
    mangaServer: {
        label: "Manga Server",
        type: "select",
        options: [
            { label: "Server 1", value: "1" },
            { label: "Server 2", value: "2" },
        ],
        default: "1",
        onChange: () => {
            if (window.location.pathname.includes("/chapter")) {
                window.location.reload();
            }
        },
    },
    showPageProgress: {
        label: "Show Page Progress",
        type: "checkbox",
        default: true,
    },
};

export const notificationSettings = {
    label: "Notifications",
    useToast: {
        label: "Use Toasts",
        type: "checkbox",
        default: true,
    },
};

export const cacheSettings = {
    label: "Cache",
    clearCache: {
        label: "Clear Cache",
        type: "button",
        confirmation: "Are you sure you want to clear the cache?",
        onClick: () => {
            db.clearCache(db.bookmarkCache);
            db.clearCache(db.mangaCache);
            db.clearCache(db.hqMangaCache);
            window.location.reload();
        },
    },
};

const allSettings = [
    generalSettings,
    mangaSettings,
    notificationSettings,
    cacheSettings,
];
const settings = {
    ...generalSettings,
    ...mangaSettings,
    ...notificationSettings,
    ...cacheSettings,
};

type SettingMap = (typeof allSettings)[number];

const getDefaultSettings = (): SettingsInterface => {
    const defaults: Record<string, unknown> = {};
    for (const key in settings) {
        if (key === "label") continue;
        const setting = settings[key as keyof typeof settings];
        if (typeof setting !== "string" && "default" in setting) {
            defaults[key] = setting.default;
        }
    }
    return defaults as SettingsInterface;
};

export const defaultSettings = getDefaultSettings();

/**
 * Dispatches a custom event when a setting is changed.
 * This function only works in browser environments.
 *
 * @param key - The settings key to be changed
 * @param value - The new value for the setting
 * @param previousValue - The previous value of the setting
 *
 * @example
 * ```ts
 * dispatchSettingsChange('darkMode', true);
 * ```
 */
export function dispatchSettingsChange<T extends SettingValue>(
    key: keyof SettingsInterface,
    value: T,
    previousValue: T,
) {
    if (typeof window !== "undefined") {
        const event = new CustomEvent<SettingsChangeEvent>(
            SETTINGS_CHANGE_EVENT,
            {
                detail: {
                    key,
                    value,
                    previousValue,
                },
            },
        );
        window.dispatchEvent(event);
    }
}
/**
 * A React hook that listens for settings change events.
 *
 * This hook subscribes to custom settings change events and calls the provided callback
 * when settings are modified. It automatically handles cleanup by removing the event
 * listener when the component unmounts.
 *
 * @param callback - The function to be called when settings change. Receives a CustomEvent
 * containing the settings change details.
 *
 * @example
 * ```tsx
 * useSettingsChange((event) => {
 *   console.log('Settings changed:', event.detail);
 * });
 * ```
 */
export function useSettingsChange(
    callback: (event: CustomEvent<SettingsChangeEvent>) => void,
) {
    React.useEffect(() => {
        const handler = (event: Event) => {
            callback(event as CustomEvent<SettingsChangeEvent>);
        };
        window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
        return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
    }, [callback]);
}

/**
 * Retrieves a specific setting value from local storage.
 *
 * @param key - The setting key to retrieve from the settings object
 * @returns The value of the specified setting key if found in localStorage, the default value if the key exists in defaultSettings, or null if neither exists or if running server-side
 */
export function getSetting(key: keyof SettingsInterface) {
    if (typeof window !== "undefined") {
        const storedSetting = localStorage.getItem("settings");
        if (storedSetting) {
            const settings = JSON.parse(storedSetting);
            return settings[key] ?? defaultSettings[key];
        }
    }
    return null;
}

/**
 * Creates a map of settings with handlers to update the settings.
 *
 * @param settingsMap - The settings map object.
 * @param currentSettings - The current settings object.
 * @param setSettings - A function to update the settings.
 * @returns A map of settings with their current values and change handlers.
 */
export const createSettingsMap = (
    settingsMap: SettingMap,
    currentSettings: SettingsInterface,
    setSettings: (newSettings: SettingsInterface) => void,
): SettingsMap => {
    const createHandler =
        (
            key: keyof SettingsInterface,
            customHandler?: (value: SettingValue) => void,
        ) =>
        (value: SettingValue) => {
            setSettings({ ...currentSettings, [key]: value });
            customHandler?.(value);
        };

    const returnSettings: SettingsMap = {};
    for (const [key, definition] of Object.entries(settingsMap)) {
        const keyName = key as keyof SettingsInterface;
        const setting = definition as Setting;
        const onChange = createHandler(keyName, setting.onChange);
        returnSettings[key] = {
            ...setting,
            value: currentSettings[keyName],
            onChange,
        } as Setting;
    }
    return returnSettings;
};

/**
 * Creates a map of settings with their corresponding handlers and values.
 *
 * @param currentSettings - The current state of all settings
 * @param setSettings - A function to update the settings state
 * @returns A record object mapping setting labels to their respective SettingsMap objects
 */
export const createAllSettingsMaps = (
    currentSettings: SettingsInterface,
    setSettings: (newSettings: SettingsInterface) => void,
) => {
    let settingsMap: Record<string, SettingsMap> = {};
    allSettings.forEach((setting) => {
        settingsMap[setting.label] = createSettingsMap(
            setting,
            currentSettings,
            setSettings,
        );
    });

    return settingsMap;
};

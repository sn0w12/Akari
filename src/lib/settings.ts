import { defaultSettings, SettingsInterface } from "@/components/Header";
import React from "react";

export const SETTINGS_CHANGE_EVENT = "settingsChange";
export interface SettingsChangeEvent {
    key: keyof SettingsInterface;
    value: any;
    previousValue: any;
}

/**
 * Dispatches a custom event when a setting is changed.
 * This function only works in browser environments.
 *
 * @param key - The settings key to be changed
 * @param value - The new value for the setting
 *
 * @example
 * ```ts
 * dispatchSettingsChange('darkMode', true);
 * ```
 */
export function dispatchSettingsChange<T>(
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
 * @param key - The setting key to retrieve from the settings object
 * @returns The value of the specified setting key if found in localStorage, the default value if the key exists in defaultSettings, or null if neither exists or if running server-side
 */
export function getSetting(key: keyof SettingsInterface) {
    if (typeof window !== "undefined") {
        const storedSetting = localStorage.getItem("settings");
        if (storedSetting) {
            const settings = JSON.parse(storedSetting);
            return settings[key] || defaultSettings[key];
        }
    }
    return null;
}

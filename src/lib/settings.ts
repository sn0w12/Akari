"use client";

import React from "react";
import { ShortcutOptions, useShortcut } from "@/hooks/use-shortcut";
import { APP_SETTINGS } from "@/config";
import { DeviceType } from "@/contexts/device-context";

type AppSettingsCategories = typeof APP_SETTINGS;
type CategoryKeys = keyof AppSettingsCategories;
type SettingsByCategory<T extends CategoryKeys> =
    AppSettingsCategories[T]["settings"];
type AllSettings = {
    [C in CategoryKeys]: SettingsByCategory<C>;
}[CategoryKeys];
type SettingKeys = {
    [C in CategoryKeys]: keyof SettingsByCategory<C>;
}[CategoryKeys];
type SettingDefaultType<T extends SettingKeys> = T extends keyof AllSettings
    ? AllSettings[T] extends { default: infer D }
        ? D
        : never
    : never;
export type SettingsInterface = {
    [K in SettingKeys]: SettingDefaultType<K>;
};

type AllSettingsFlat = {
    [C in keyof typeof APP_SETTINGS]: (typeof APP_SETTINGS)[C]["settings"];
}[keyof typeof APP_SETTINGS];
type UnionToIntersection<U> = (
    U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
    ? I
    : never;
type AllSettingsMerged = UnionToIntersection<AllSettingsFlat>;
type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends { type: U } ? K : never;
}[keyof T];

export type CheckboxSettingKeys = KeysOfType<AllSettingsMerged, "checkbox">;
export type CheckboxGroupSettingKeys = KeysOfType<
    AllSettingsMerged,
    "checkbox-group"
>;
export type TextSettingKeys = KeysOfType<AllSettingsMerged, "text">;
export type PasswordSettingKeys = KeysOfType<AllSettingsMerged, "password">;
export type EmailSettingKeys = KeysOfType<AllSettingsMerged, "email">;
export type NumberSettingKeys = KeysOfType<AllSettingsMerged, "number">;
export type TextareaSettingKeys = KeysOfType<AllSettingsMerged, "textarea">;
export type SelectSettingKeys = KeysOfType<AllSettingsMerged, "select">;
export type RadioSettingKeys = KeysOfType<AllSettingsMerged, "radio">;
export type ShortcutSettingKeys = KeysOfType<AllSettingsMerged, "shortcut">;
export type ButtonSettingKeys = KeysOfType<AllSettingsMerged, "button">;
export type SliderSettingKeys = KeysOfType<AllSettingsMerged, "slider">;
export type ColorSettingKeys = KeysOfType<AllSettingsMerged, "color">;
export type CustomRenderSettingKeys = KeysOfType<
    AllSettingsMerged,
    "custom-render"
>;

export const SETTINGS_CHANGE_EVENT = "settingsChange";
export interface SettingsChangeEvent {
    key: keyof SettingsInterface;
    value: SettingValue;
    previousValue: SettingValue;
}

// Get default values for all settings
const getDefaultSettings = (): SettingsInterface => {
    const defaults: Record<string, unknown> = {};

    Object.entries(APP_SETTINGS).forEach(([, category]) => {
        Object.entries(category.settings).forEach(([key, setting]) => {
            const settingDef = setting as Setting;
            defaults[key] =
                typeof settingDef.default === "function"
                    ? settingDef.default()
                    : settingDef.default;
        });
    });

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
    previousValue: T
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
            }
        );
        window.dispatchEvent(event);
    }
}

/**
 * A React hook that listens for settings change events.
 *
 * @param callback - The function to be called when settings change
 * @param watchKey - Optional key to only listen for changes to a specific setting
 *
 * @example
 * ```tsx
 * // Watch all settings changes
 * useSettingsChange((event) => {
 *   log('Settings changed:', event.detail);
 * });
 *
 * // Watch only theme changes
 * useSettingsChange((event) => {
 *   log('Theme changed:', event.detail.value);
 * }, 'theme');
 * ```
 */
export function useSettingsChange(
    callback: (event: CustomEvent<SettingsChangeEvent>) => void,
    watchKey?: keyof SettingsInterface
) {
    React.useEffect(() => {
        const handler = (event: Event) => {
            const settingsEvent = event as CustomEvent<SettingsChangeEvent>;
            if (!watchKey || settingsEvent.detail.key === watchKey) {
                callback(settingsEvent);
            }
        };
        window.addEventListener(SETTINGS_CHANGE_EVENT, handler);
        return () => window.removeEventListener(SETTINGS_CHANGE_EVENT, handler);
    }, [callback, watchKey]);
}

/**
 * A React hook that returns a setting value and stays up-to-date with changes.
 *
 * @param key - The setting key to retrieve and watch
 * @returns The current value of the setting
 *
 * @example
 * ```tsx
 * const theme = useSetting('theme');
 * // theme will automatically update when the theme setting changes
 * ```
 */
export function useSetting<K extends SettingKeys>(
    key: K
): SettingsInterface[K] {
    const [value, setValue] = React.useState<SettingsInterface[K]>(
        () => getSetting(key) ?? defaultSettings[key]
    );

    useSettingsChange((event) => {
        if (event.detail.key === key) {
            setValue(event.detail.value as SettingsInterface[K]);
        }
    }, key);

    return value;
}

/**
 * Retrieves a specific setting value from local storage.
 *
 * @param key - The setting key to retrieve from the settings object
 * @returns The value of the specified setting key if found in localStorage, the default value if the key exists in defaultSettings, or null if neither exists or if running server-side
 */
export function getSetting<K extends SettingKeys>(
    key: K
): SettingsInterface[K] | null {
    if (typeof window === "undefined") return null;

    const storedSetting = localStorage.getItem("settings");
    if (storedSetting) {
        const settings = JSON.parse(storedSetting);
        return settings[key] ?? defaultSettings[key];
    }

    const def = defaultSettings[key];
    return typeof def === "function" ? def() : def;
}

/**
 * React hook to bind a callback to a shortcut defined in settings.
 * @param key - The key of the shortcut setting (type-safe)
 * @param callback - The function to call when the shortcut is triggered
 * @param options - Optional shortcut options
 */
export function useShortcutSetting(
    key: ShortcutSettingKeys,
    callback: () => void,
    options: ShortcutOptions = {}
) {
    const shortcut = useSetting(key);
    useShortcut(shortcut, callback, options);
}

/**
 * Creates a map of settings with handlers to update the settings.
 *
 * @param categoryKey - The category key from APP_SETTINGS
 * @param currentSettings - The current settings object.
 * @param setSettings - A function to update the settings.
 * @returns A map of settings with their current values and change handlers.
 */
export const createSettingsMap = (
    categoryKey: keyof typeof APP_SETTINGS,
    currentSettings: SettingsInterface,
    setSettings: (newSettings: SettingsInterface) => void
): Record<string, Setting> => {
    const categorySettings = APP_SETTINGS[categoryKey]?.settings || {};
    const returnSettings: Record<string, Setting> = {};

    for (const [key, settingDef] of Object.entries(categorySettings)) {
        const setting = settingDef as Setting;
        const createHandler = (value: SettingValue) => {
            setSettings({
                ...currentSettings,
                [key]: value,
            } as SettingsInterface);
            setting.onChange?.(value);
        };

        returnSettings[key] = {
            ...setting,
            value: currentSettings[key as keyof SettingsInterface],
            onChange: createHandler,
        };
    }

    return returnSettings;
};

/**
 * Creates a map of settings with their corresponding handlers and values.
 *
 * @param currentSettings - The current state of all settings
 * @param setSettings - A function to update the settings state
 * @returns A record object mapping setting labels to their respective setting maps
 */
export const createAllSettingsMaps = (
    currentSettings: SettingsInterface,
    setSettings: (newSettings: SettingsInterface) => void
) => {
    const settingsMap: Record<string, Record<string, Setting>> = {};

    Object.entries(APP_SETTINGS).forEach(([key, category]) => {
        settingsMap[category.label] = createSettingsMap(
            key as keyof typeof APP_SETTINGS,
            currentSettings,
            setSettings
        );
    });

    return settingsMap;
};

/**
 * Resets all settings to their default values.
 * Overwrites localStorage and dispatches change events for each setting.
 */
export function resetAllSettingsToDefault() {
    Object.keys(defaultSettings).forEach((key) => {
        dispatchSettingsChange(
            key as keyof SettingsInterface,
            defaultSettings[key as keyof SettingsInterface],
            getSetting(key as SettingKeys) ??
                defaultSettings[key as keyof SettingsInterface]
        );
    });
    localStorage.setItem("settings", JSON.stringify(defaultSettings));
}

export type SettingValue = string | boolean | string[];
export type SettingType =
    | "checkbox"
    | "checkbox-group"
    | "text"
    | "password"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "shortcut"
    | "button"
    | "slider"
    | "color"
    | "custom-render";
export type SettingVisibility = "desktop" | "mobile" | "pwa";

/**
 * Determines if a setting should be visible based on device type and visibility rules.
 * @param visibility - Array of visibility settings for the setting/category
 * @param deviceType - The type of device from DeviceType
 * @param isPWA - Whether the app is running as a PWA
 * @returns true if the setting should be visible, false otherwise
 */
export function shouldShowSetting(
    visibility: SettingVisibility[] | undefined,
    deviceType: DeviceType,
    isPWA: boolean
): boolean {
    if (!visibility || visibility.length === 0) {
        return true;
    }

    if (isPWA && visibility.includes("pwa")) {
        return true;
    }

    if (
        (deviceType === "mobile" || deviceType === "tablet") &&
        visibility.includes("mobile")
    ) {
        return true;
    }

    if (
        (deviceType === "desktop" || !deviceType) &&
        visibility.includes("desktop")
    ) {
        return true;
    }

    return false;
}

export interface ContextMenuItemDef {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "destructive";
}

interface BaseSetting {
    label: string;
    description?: string;
    value?: SettingValue;
    default: SettingValue | (() => SettingValue);
    onChange?: (value: SettingValue) => void;
    contextMenuItems?: ContextMenuItemDef[];
    groups?: string[];
    visibility?: SettingVisibility[];
}

export interface CheckboxSetting extends BaseSetting {
    type: "checkbox";
    value?: boolean;
    default: boolean | (() => boolean);
}

export interface CheckboxGroupSetting extends BaseSetting {
    type: "checkbox-group";
    options: { label: string; value: string }[];
    value?: string[];
    default: string[] | (() => string[]);
}

export interface TextSetting extends BaseSetting {
    type: "text" | "password" | "email" | "number";
    value?: string;
    default: string | (() => string);
}

export interface TextareaSetting extends BaseSetting {
    type: "textarea";
    value?: string;
    options?: { resize?: boolean };
    default: string | (() => string);
}

export interface SelectSetting extends BaseSetting {
    type: "select";
    options: { label: string; value: string }[];
    value?: string;
    default: string | (() => string);
}

export interface RadioSetting extends BaseSetting {
    type: "radio";
    options: { label: string; value: string }[];
    value?: string;
    default: string | (() => string);
}

export interface ShortcutSetting extends BaseSetting {
    type: "shortcut";
    value?: string;
    default: string | (() => string);
    allowOverlap?: string[];
}

export interface SliderSetting extends BaseSetting {
    type: "slider";
    min: number;
    max: number;
    step: number;
    value?: string;
    default: string | (() => string);
}

export interface ButtonSetting extends BaseSetting {
    type: "button";
    label: string;
    confirmation?: string;
    confirmVariant?: "default" | "destructive";
    onClick?: () => void;
}

export interface ColorSetting extends BaseSetting {
    type: "color";
    value?: string;
    default: string | (() => string);
}

export interface CustomRenderSetting extends BaseSetting {
    type: "custom-render";
}

export type Setting =
    | CheckboxSetting
    | CheckboxGroupSetting
    | TextSetting
    | TextareaSetting
    | SelectSetting
    | RadioSetting
    | ShortcutSetting
    | ButtonSetting
    | SliderSetting
    | ColorSetting
    | CustomRenderSetting;

export function getDefaultSettingsValue(setting: Setting): SettingValue {
    if (typeof setting.default === "function") {
        return setting.default();
    }
    return setting.default;
}

export function getSettingValue(setting: Setting): SettingValue {
    return setting.value ?? getDefaultSettingsValue(setting);
}

import React from "react";
import db from "./db";
import { setCookie } from "./cookies";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

let settingsVersion = 0;
export const useSettingsVersion = () =>
    React.useMemo(() => settingsVersion, [settingsVersion]);
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
    theme: {
        label: "Theme",
        type: "select",
        options: [
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
            { label: "System", value: "system" },
        ],
        default: "system",
    },
    fetchMalImage: {
        label: "Fetch MAL Data",
        description:
            "Updates the Akari database with better images and other info.",
        type: "checkbox",
        default: true,
        deploymentOnly: true,
    },
    fancyAnimations: {
        label: "Fancy Animations",
        description: "Such as manga detail pages cover image.",
        type: "checkbox",
        default: true,
    },
    preferSettingsPage: {
        label: "Prefer Settings Page",
        description: "Open settings page instead of the settings dialog.",
        type: "checkbox",
        default: false,
    },
    preferAccountPage: {
        label: "Prefer Account Page",
        description: "Open account page instead of the account dialog.",
        type: "checkbox",
        default: false,
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
        onChange: (value: string) => {
            setCookie("manga_server", value, "functional");
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
    saveReadingHistory: {
        label: "Save Reading History",
        description: `Saves your reading history, see the <a href="/account">account</a> page.`,
        type: "checkbox",
        default: true,
        onChange: (value: string) => {
            setCookie("save_reading_history", value, "functional");
        },
    },
};

export const notificationSettings = {
    label: "Notifications",
    useToast: {
        label: "Use Toasts",
        type: "checkbox",
        default: true,
    },
    loginToasts: {
        label: "Login Toasts",
        description: "Show warnings when you aren't logged in to a service.",
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

export const shortcutsSettings = {
    label: "Shortcuts",
    searchManga: {
        type: "shortcut",
        label: "Search Manga",
        value: "Ctrl+K",
        default: "Ctrl+K",
    },
    toggleSidebar: {
        type: "shortcut",
        label: "Toggle Sidebar",
        value: "Ctrl+Shift+B",
        default: "Ctrl+Shift+B",
    },
    openSettings: {
        type: "shortcut",
        label: "Open Settings",
        value: "Ctrl+,",
        default: "Ctrl+,",
    },
    openAccount: {
        type: "shortcut",
        label: "Open Account",
        value: "Ctrl+.",
        default: "Ctrl+.",
    },
    navigateBookmarks: {
        type: "shortcut",
        label: "Navigate to Bookmarks",
        value: "Ctrl+B",
        default: "Ctrl+B",
    },
};

const allSettings = [
    generalSettings,
    mangaSettings,
    notificationSettings,
    shortcutsSettings,
    cacheSettings,
];
type ExcludeLabel<T> = Omit<T, "label">;
type MergeSettings<T extends readonly unknown[]> = ExcludeLabel<
    UnionToIntersection<T[number]>
>;
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

const settings: MergeSettings<typeof allSettings> = Object.assign(
    {},
    ...allSettings.map((settingGroup) => {
        const { label, ...rest } = settingGroup;
        return rest;
    }),
);

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
        settingsVersion++;
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
 * @param callback - The function to be called when settings change
 * @param watchKey - Optional key to only listen for changes to a specific setting
 *
 * @example
 * ```tsx
 * // Watch all settings changes
 * useSettingsChange((event) => {
 *   console.log('Settings changed:', event.detail);
 * });
 *
 * // Watch only theme changes
 * useSettingsChange((event) => {
 *   console.log('Theme changed:', event.detail.value);
 * }, 'theme');
 * ```
 */
export function useSettingsChange(
    callback: (event: CustomEvent<SettingsChangeEvent>) => void,
    watchKey?: keyof SettingsInterface,
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
export function useSetting<K extends keyof SettingsInterface>(key: K) {
    const [value, setValue] = React.useState<SettingsInterface[K]>(
        () => getSetting(key) ?? defaultSettings[key],
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
 * Retrieves multiple settings from local storage.
 *
 * @param keys - Array of setting keys to retrieve
 * @returns Object containing the requested settings with their values
 */
export function getSettings(keys: (keyof SettingsInterface)[]) {
    if (typeof window === "undefined") return null;

    const storedSettings = localStorage.getItem("settings");
    if (!storedSettings) {
        return keys.reduce<Record<keyof SettingsInterface, SettingValue>>(
            (acc, key) => {
                acc[key] = defaultSettings[key];
                return acc;
            },
            {} as Record<keyof SettingsInterface, SettingValue>,
        );
    }

    const settings = JSON.parse(storedSettings);
    return keys.reduce((acc, key) => {
        acc[key] = settings[key] ?? defaultSettings[key];
        return acc;
    }, {} as Partial<SettingsInterface>);
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
    const settingsMap: Record<string, SettingsMap> = {};
    allSettings.forEach((setting) => {
        settingsMap[setting.label] = createSettingsMap(
            setting,
            currentSettings,
            setSettings,
        );
    });

    return settingsMap;
};

/**
 * Creates a static map of all settings with their default values.
 * Unlike createAllSettingsMaps, this doesn't include change handlers and uses default values.
 * Useful for server-side rendering or static contexts.
 *
 * @returns A record object mapping setting labels to their respective SettingsMap objects with default values
 */
export const getDefaultSettingsMaps = (): Record<string, SettingsMap> => {
    const staticSettingsMap: Record<string, SettingsMap> = {};

    allSettings.forEach((settingGroup) => {
        const groupMap: SettingsMap = {};

        for (const [key, definition] of Object.entries(settingGroup)) {
            if (key === "label") continue;

            const setting = definition as Setting;
            groupMap[key] = {
                ...setting,
                value: setting.default,
                // Provide a no-op function as onChange handler
                onChange: () => {},
            } as Setting;
        }

        staticSettingsMap[settingGroup.label] = groupMap;
    });

    return staticSettingsMap;
};

export type SettingValue = string | boolean | string[];
export type SettingType =
    | "checkbox"
    | "text"
    | "password"
    | "email"
    | "number"
    | "textarea"
    | "select"
    | "radio"
    | "shortcut"
    | "button";

interface BaseSetting {
    label: string;
    description?: string;
    value: SettingValue;
    default: SettingValue;
    onChange: (value: SettingValue) => void;
    deploymentOnly?: boolean;
}

interface CheckboxSetting extends BaseSetting {
    type: "checkbox";
    value: boolean;
    default: boolean;
}

interface TextSetting extends BaseSetting {
    type: "text" | "password" | "email" | "number";
    value: string;
    default: string;
}

interface TextareaSetting extends BaseSetting {
    type: "textarea";
    value: string;
    default: string;
}

interface SelectSetting extends BaseSetting {
    type: "select";
    options: { label: string; value: string }[];
    value: string;
    default: string;
}

interface RadioSetting extends BaseSetting {
    type: "radio";
    options: { label: string; value: string }[];
    value: string;
    default: string;
}

interface ShortcutSetting extends BaseSetting {
    type: "shortcut";
    value: string;
    default: string;
}

interface ButtonSetting extends BaseSetting {
    type: "button";
    label: string;
    confirmation?: string;
    confirmPositive?: boolean;
    onClick: () => void;
}

export type Setting =
    | CheckboxSetting
    | TextSetting
    | TextareaSetting
    | SelectSetting
    | RadioSetting
    | ShortcutSetting
    | ButtonSetting;

export interface SettingsMap {
    [key: string]: Setting;
}

function getSettingValue(setting: Setting): SettingValue {
    switch (setting.type) {
        case "checkbox":
            return (
                (setting as CheckboxSetting).value ??
                (setting as CheckboxSetting).default
            );
        case "text":
        case "password":
        case "email":
        case "number":
        case "textarea":
        case "select":
        case "radio":
        case "shortcut":
            return (
                (setting as BaseSetting).value ??
                (setting as BaseSetting).default
            );
        case "button":
            return "";
        default:
            const _exhaustiveCheck: never = setting;
            return _exhaustiveCheck as never;
    }
}

function findDuplicateShortcuts(settingsMap: SettingsMap): Set<string> {
    const shortcuts = new Set<string>();
    const duplicates = new Set<string>();

    Object.values(settingsMap).forEach((setting) => {
        if (setting.type === "shortcut") {
            const value =
                (setting.value as string) ?? (setting.default as string);
            if (shortcuts.has(value)) {
                duplicates.add(value);
            }
            shortcuts.add(value);
        }
    });

    return duplicates;
}

export function renderInput(
    key: string,
    setting: Setting,
    settingsMap: SettingsMap,
) {
    switch (setting.type) {
        case "checkbox":
            return (
                <Switch
                    id={key}
                    checked={getSettingValue(setting) as boolean}
                    onCheckedChange={(value) => {
                        setting.onChange(value);
                    }}
                />
            );
        case "text":
        case "password":
        case "email":
        case "number":
            return (
                <Input
                    id={key}
                    type={setting.type}
                    value={getSettingValue(setting) as string}
                    onChange={(e) => {
                        setting.onChange(e.target.value);
                    }}
                    className="max-w-xs"
                />
            );
        case "textarea":
            return (
                <Textarea
                    id={key}
                    value={getSettingValue(setting) as string}
                    onChange={(e: {
                        target: { value: string | boolean | string[] };
                    }) => {
                        setting.onChange(e.target.value);
                    }}
                    className="max-w-xs"
                />
            );
        case "select":
            return (
                <Select
                    value={getSettingValue(setting) as string}
                    onValueChange={(value) => {
                        setting.onChange(value);
                    }}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        {setting.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case "radio":
            return (
                <RadioGroup
                    value={getSettingValue(setting) as string}
                    onValueChange={(value) => {
                        setting.onChange(value);
                    }}
                    className="flex flex-col space-y-1"
                >
                    {setting.options.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center space-x-2"
                        >
                            <RadioGroupItem
                                value={option.value}
                                id={`${key}-${option.value}`}
                            />
                            <Label htmlFor={`${key}-${option.value}`}>
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            );
        case "shortcut":
            const duplicates = findDuplicateShortcuts(settingsMap);
            const isDuplicate = duplicates.has(
                getSettingValue(setting) as string,
            );

            return (
                <Input
                    id={key}
                    type="text"
                    value={getSettingValue(setting) as string}
                    className={`max-w-60 ${isDuplicate ? "border-red-500 bg-red-800 focus-visible:ring-red-500" : ""}`}
                    onKeyDown={(e) => {
                        e.preventDefault();
                        const keys: string[] = [];
                        if (e.ctrlKey) keys.push("Ctrl");
                        if (e.shiftKey) keys.push("Shift");
                        if (e.altKey) keys.push("Alt");
                        if (
                            e.key !== "Control" &&
                            e.key !== "Shift" &&
                            e.key !== "Alt"
                        ) {
                            keys.push(e.key.toUpperCase());
                        }
                        if (keys.length > 0) {
                            setting.onChange(keys.join("+"));
                        }
                    }}
                    readOnly
                    placeholder="Press keys..."
                />
            );
        case "button":
            if (!setting.confirmation) {
                return (
                    <Button
                        onClick={() => (setting as ButtonSetting).onClick()}
                    >
                        {setting.label}
                    </Button>
                );
            }

            return (
                <ConfirmDialog
                    triggerButton={
                        <Button>{(setting as ButtonSetting).label}</Button>
                    }
                    title="Confirm"
                    message={(setting as ButtonSetting).confirmation ?? ""}
                    confirmColor={`${setting.confirmPositive ? "bg-green-600 border-green-500 hover:bg-green-500" : "bg-red-600 border-red-500 hover:bg-red-500"}`}
                    onConfirm={() => (setting as ButtonSetting).onClick()}
                />
            );
        default:
            return null;
    }
}

export function renderInputSkeleton(setting: Setting) {
    switch (setting.type) {
        case "checkbox":
            return (
                <Skeleton className="h-6 w-11 rounded-full border-2 border-transparent mb-1" />
            );
        case "text":
        case "password":
        case "email":
        case "number":
        case "shortcut":
            return <Skeleton className="h-10 w-48" />;
        case "textarea":
            return <Skeleton className="h-24 w-48" />;
        case "select":
            return <Skeleton className="h-10 w-48" />;
        case "radio":
            return (
                <div className="flex flex-col space-y-2">
                    {setting.options.map((_, index) => (
                        <div
                            key={index}
                            className="flex items-center space-x-2"
                        >
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    ))}
                </div>
            );
        case "button":
            return <Button>{setting.label}</Button>;
        default:
            return null;
    }
}

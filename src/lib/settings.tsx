"use client";

import React from "react";
import { Input, NumberInput } from "@/components/ui/input";
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
import { ButtonConfirmDialog } from "@/components/ui/confirm";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/components/ui/color-picker";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
    ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { RotateCcw } from "lucide-react";
import { ShortcutOptions, useShortcut } from "@/hooks/use-shortcut";
import { APP_SETTINGS } from "@/config";
import { cn } from "@/lib/utils";

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
 * Retrieves multiple settings from local storage.
 *
 * @param keys - Array of setting keys to retrieve
 * @returns Object containing the requested settings with their values
 */
export function getSettings<K extends SettingKeys>(keys: K[]) {
    if (typeof window === "undefined") return null;

    const storedSettings = localStorage.getItem("settings");
    if (!storedSettings) {
        return keys.reduce<Partial<SettingsInterface>>((acc, key) => {
            acc[key] = defaultSettings[key];
            return acc;
        }, {});
    }

    const settings = JSON.parse(storedSettings);
    return keys.reduce<Partial<SettingsInterface>>((acc, key) => {
        acc[key] = settings[key] ?? defaultSettings[key];
        return acc;
    }, {});
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
 * Creates a static map of all settings with their default values.
 * Unlike createAllSettingsMaps, this doesn't include change handlers and uses default values.
 * Useful for server-side rendering or static contexts.
 *
 * @returns A record object mapping setting labels to their respective setting maps with default values
 */
export const getDefaultSettingsMaps = (): Record<
    string,
    Record<string, Setting>
> => {
    const staticSettingsMap: Record<string, Record<string, Setting>> = {};

    Object.entries(APP_SETTINGS).forEach(([, category]) => {
        const groupMap: Record<string, Setting> = {};

        Object.entries(category.settings).forEach(([key, settingDef]) => {
            const setting = settingDef as Setting;

            // Create a type-safe copy of the setting with its default value
            const settingCopy = { ...setting };
            const defaultValue =
                typeof setting.default === "function"
                    ? setting.default()
                    : setting.default;

            // Type-safe assignment of value based on setting type
            switch (setting.type) {
                case "checkbox":
                    (settingCopy as CheckboxSetting).value =
                        defaultValue as boolean;
                    break;
                case "text":
                case "password":
                case "email":
                case "number":
                case "textarea":
                case "select":
                case "radio":
                case "shortcut":
                case "slider":
                case "color":
                    (settingCopy as BaseSetting).value = defaultValue as string;
                    break;
            }

            // Add no-op onChange handler
            settingCopy.onChange = () => {};

            groupMap[key] = settingCopy;
        });

        staticSettingsMap[category.label] = groupMap;
    });

    return staticSettingsMap;
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
}

interface CheckboxSetting extends BaseSetting {
    type: "checkbox";
    value?: boolean;
    default: boolean | (() => boolean);
}

interface TextSetting extends BaseSetting {
    type: "text" | "password" | "email" | "number";
    value?: string;
    default: string | (() => string);
}

interface TextareaSetting extends BaseSetting {
    type: "textarea";
    value?: string;
    options?: { resize?: boolean };
    default: string | (() => string);
}

interface SelectSetting extends BaseSetting {
    type: "select";
    options: { label: string; value: string }[];
    value?: string;
    default: string | (() => string);
}

interface RadioSetting extends BaseSetting {
    type: "radio";
    options: { label: string; value: string }[];
    value?: string;
    default: string | (() => string);
}

interface ShortcutSetting extends BaseSetting {
    type: "shortcut";
    value?: string;
    default: string | (() => string);
    allowOverlap?: string[];
}

interface SliderSetting extends BaseSetting {
    type: "slider";
    min: number;
    max: number;
    step: number;
    value?: string;
    default: string | (() => string);
}

interface ButtonSetting extends BaseSetting {
    type: "button";
    label: string;
    confirmation?: string;
    confirmVariant?: "default" | "destructive";
    onClick?: () => void;
}

interface ColorSetting extends BaseSetting {
    type: "color";
    value?: string;
    default: string | (() => string);
}

interface CustomRenderSetting extends BaseSetting {
    type: "custom-render";
}

export type Setting =
    | CheckboxSetting
    | TextSetting
    | TextareaSetting
    | SelectSetting
    | RadioSetting
    | ShortcutSetting
    | ButtonSetting
    | SliderSetting
    | ColorSetting
    | CustomRenderSetting;

function getDefaultSettingsValue(setting: Setting): SettingValue {
    if (typeof setting.default === "function") {
        return setting.default();
    }
    return setting.default;
}

function getSettingValue(setting: Setting): SettingValue {
    return setting.value ?? getDefaultSettingsValue(setting);
}

function findDuplicateShortcuts(
    settingsMap: Record<string, Setting>
): Set<string> {
    const shortcuts = new Map<string, string[]>();
    const duplicates = new Set<string>();

    Object.entries(settingsMap).forEach(([key, setting]) => {
        if (setting.type === "shortcut") {
            const value = getSettingValue(setting) as string;
            if (!shortcuts.has(value)) {
                shortcuts.set(value, []);
            }
            shortcuts.get(value)!.push(key);
        }
    });

    // Check for duplicates
    shortcuts.forEach((settingKeys, shortcutValue) => {
        if (settingKeys.length > 1) {
            const hasUnallowedOverlap = settingKeys.some((currentKey) => {
                const currentSetting = settingsMap[
                    currentKey
                ] as ShortcutSetting;
                const otherKeys = settingKeys.filter((k) => k !== currentKey);

                // If this setting doesn't have allowOverlap, it doesn't allow any overlaps
                if (
                    !currentSetting.allowOverlap ||
                    currentSetting.allowOverlap.length === 0
                ) {
                    return true;
                }

                return otherKeys.some(
                    (otherKey) =>
                        !currentSetting.allowOverlap!.includes(
                            otherKey as ShortcutSettingKeys
                        )
                );
            });

            if (hasUnallowedOverlap) {
                duplicates.add(shortcutValue);
            }
        }
    });

    return duplicates;
}

/**
 * Normalizes a KeyboardEvent or string to a canonical shortcut key name.
 * Examples: "Control" => "Ctrl", " " => "Space", "a" => "A"
 */
export function normalizeKeyInput(key: string | KeyboardEvent): string {
    const k = typeof key === "string" ? key : key.key;

    switch (k) {
        case "Control":
        case "Ctrl":
            return "Ctrl";
        case "Shift":
            return "Shift";
        case "Alt":
            return "Alt";
        case " ":
        case "Spacebar":
        case "Space":
            return "Space";
        case "Meta":
        case "Command":
        case "Cmd":
            return "Meta";
        default:
            // For single characters, return uppercase
            if (k.length === 1) return k.toUpperCase();
            // For function keys, keep as is (e.g., F1, F2)
            if (/^F\d+$/.test(k)) return k.toUpperCase();
            // Otherwise, return as-is
            return k;
    }
}

export function renderInput(
    key: string,
    setting: Setting,
    settingsMap: Record<string, Setting>
) {
    if (setting.type === "custom-render") {
        return null; // Will be handled by custom renderer in the component
    }

    const renderSettingInput = () => {
        switch (setting.type) {
            case "checkbox":
                return (
                    <Switch
                        id={key}
                        checked={getSettingValue(setting) as boolean}
                        onCheckedChange={(value) => {
                            setting.onChange?.(value);
                        }}
                    />
                );
            case "text":
            case "password":
            case "email":
                return (
                    <Input
                        id={key}
                        type={setting.type}
                        value={getSettingValue(setting) as string}
                        onChange={(e) => {
                            setting.onChange?.(e.target.value);
                        }}
                        className="max-w-xs"
                    />
                );
            case "number": {
                return (
                    <NumberInput
                        id={key}
                        type={setting.type}
                        value={getSettingValue(setting) as string}
                        onChange={(e) => {
                            setting.onChange?.(e.target.value);
                        }}
                        wrapperClassName="max-w-xs"
                    />
                );
            }
            case "textarea": {
                const textareaOptions = setting.options || {};
                return (
                    <Textarea
                        id={key}
                        value={getSettingValue(setting) as string}
                        onChange={(e: {
                            target: { value: string | boolean | string[] };
                        }) => {
                            setting.onChange?.(e.target.value);
                        }}
                        className={cn("max-w-xs", {
                            "resize-none": textareaOptions.resize === false,
                        })}
                    />
                );
            }
            case "select":
                return (
                    <Select
                        value={getSettingValue(setting) as string}
                        onValueChange={(value) => {
                            setting.onChange?.(value);
                        }}
                    >
                        <ContextMenu>
                            <ContextMenuTrigger asChild>
                                <SelectTrigger className="w-48">
                                    <SelectValue
                                        placeholder={"Select an option"}
                                    />
                                </SelectTrigger>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                                <ContextMenuItem
                                    onClick={() =>
                                        setting.onChange?.(
                                            getDefaultSettingsValue(setting)
                                        )
                                    }
                                    className="flex gap-2"
                                    variant="destructive"
                                >
                                    <RotateCcw className="size-4" />
                                    <span>{"Reset"}</span>
                                </ContextMenuItem>

                                {setting.contextMenuItems &&
                                    setting.contextMenuItems.length > 0 && (
                                        <>
                                            <ContextMenuSeparator />
                                            {setting.contextMenuItems.map(
                                                (item, index) => (
                                                    <ContextMenuItem
                                                        key={index}
                                                        onClick={item.onClick}
                                                        variant={item.variant}
                                                        className="flex gap-2"
                                                    >
                                                        {item.icon && item.icon}
                                                        <span>
                                                            {item.label}
                                                        </span>
                                                    </ContextMenuItem>
                                                )
                                            )}
                                        </>
                                    )}
                            </ContextMenuContent>
                        </ContextMenu>
                        <SelectContent>
                            {setting.options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
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
                            setting.onChange?.(value);
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
            case "shortcut": {
                const duplicates = findDuplicateShortcuts(settingsMap);
                const isDuplicate = duplicates.has(
                    getSettingValue(setting) as string
                );

                return (
                    <Input
                        id={key}
                        type="text"
                        value={getSettingValue(setting) as string}
                        className={`max-w-60 ${
                            isDuplicate
                                ? "border-destructive bg-destructive/20 focus-visible:ring-destructive"
                                : ""
                        }`}
                        onKeyDown={(e) => {
                            e.preventDefault();
                            const keys: string[] = [];
                            if (e.ctrlKey) keys.push("Ctrl");
                            if (e.shiftKey) keys.push("Shift");
                            if (e.altKey) keys.push("Alt");

                            if (e.key === " " || e.code === "Space") {
                                keys.push("Space");
                            } else if (
                                e.key !== "Control" &&
                                e.key !== "Shift" &&
                                e.key !== "Alt"
                            ) {
                                keys.push(e.key.toUpperCase());
                            }

                            if (keys.length > 0) {
                                setting.onChange?.(keys.join("+"));
                            }
                        }}
                        readOnly
                        placeholder={"Press a key combination..."}
                    />
                );
            }
            case "slider": {
                const sliderSetting = setting as SliderSetting;
                const value = parseInt(getSettingValue(setting) as string);
                const maxLen = Math.max(
                    sliderSetting.min.toString().length,
                    sliderSetting.max.toString().length
                );

                return (
                    <div className="flex w-full flex-col gap-2">
                        <div className="flex items-center justify-between font-mono">
                            <span
                                style={{
                                    minWidth: `${maxLen}ch`,
                                    textAlign: "start",
                                }}
                            >
                                {sliderSetting.min}
                            </span>
                            <input
                                className={cn(
                                    "bg-background w-12 border-0 text-center font-medium"
                                )}
                                type="number"
                                max={sliderSetting.max}
                                min={sliderSetting.min}
                                value={value.toString()}
                                size={value.toString().length}
                                onChange={(e) => {
                                    const newValue = parseInt(e.target.value);
                                    if (!isNaN(newValue)) {
                                        setting.onChange?.(
                                            Math.min(
                                                newValue,
                                                sliderSetting.max
                                            ).toString()
                                        );
                                    }
                                }}
                            />
                            <span
                                style={{
                                    minWidth: `${maxLen}ch`,
                                    textAlign: "end",
                                }}
                            >
                                {sliderSetting.max}
                            </span>
                        </div>
                        <Slider
                            id={key}
                            min={sliderSetting.min}
                            max={sliderSetting.max}
                            step={sliderSetting.step}
                            value={[value]}
                            onValueChange={(values) => {
                                setting.onChange?.(values[0].toString());
                            }}
                        />
                    </div>
                );
            }
            case "button":
                if (!setting.confirmation) {
                    return (
                        <Button
                            onClick={() =>
                                (setting as ButtonSetting).onClick?.()
                            }
                        >
                            {setting.label}
                        </Button>
                    );
                }

                return (
                    <ButtonConfirmDialog
                        triggerButton={<Button>{setting.label}</Button>}
                        title={"Confirm"}
                        description={
                            (setting as ButtonSetting).confirmation ?? ""
                        }
                        onConfirm={() => (setting as ButtonSetting).onClick?.()}
                        variant={setting.confirmVariant ?? "default"}
                    />
                );
            case "color":
                return (
                    <ColorPicker
                        value={getSettingValue(setting) as string}
                        onChange={(value: SettingValue) => {
                            setting.onChange?.(value);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    if (setting.type === "button" || setting.type === "select") {
        return renderSettingInput();
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {renderSettingInput()}
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem
                    onClick={() =>
                        setting.onChange?.(getDefaultSettingsValue(setting))
                    }
                    className="flex gap-2"
                    variant="destructive"
                >
                    <RotateCcw className="size-4" />
                    <span>{"Reset"}</span>
                </ContextMenuItem>

                {setting.contextMenuItems &&
                    setting.contextMenuItems.length > 0 && (
                        <>
                            <ContextMenuSeparator />
                            {setting.contextMenuItems.map((item, index) => (
                                <ContextMenuItem
                                    key={index}
                                    onClick={item.onClick}
                                    variant={item.variant}
                                    className="flex gap-2"
                                >
                                    {item.icon && item.icon}
                                    <span>{item.label}</span>
                                </ContextMenuItem>
                            ))}
                        </>
                    )}
            </ContextMenuContent>
        </ContextMenu>
    );
}

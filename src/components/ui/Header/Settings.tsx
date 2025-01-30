"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CardContent } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "../dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfirmDialog from "@/components/ui/confirmDialog";
import { Button } from "@/components/ui/button";

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

interface SettingsFormProps {
    settingsTabs: Record<string, SettingsMap>;
}

function SettingsForm({ settingsTabs }: SettingsFormProps) {
    const defaultTab = Object.keys(settingsTabs)[0];
    const isProduction = process.env.NODE_ENV === "production";

    const shouldShowSetting = (setting: Setting) => {
        if (
            setting.deploymentOnly &&
            (!isProduction || window.location.hostname === "localhost")
        ) {
            return false;
        }
        return true;
    };

    return (
        <>
            <DialogHeader className="border-b pb-4">
                <DialogTitle>Settings</DialogTitle>
            </DialogHeader>
            <CardContent className="min-h-[400px]">
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList
                        className="w-full h-auto gap-1 grid grid-flow-dense auto-rows-auto"
                        style={{
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(100px, 1fr))",
                        }}
                    >
                        {Object.keys(settingsTabs).map((tabKey) => (
                            <TabsTrigger key={tabKey} value={tabKey}>
                                {tabKey}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {Object.entries(settingsTabs).map(
                        ([tabKey, settingsMap]) => (
                            <TabsContent
                                key={tabKey}
                                value={tabKey}
                                className="space-y-4"
                            >
                                {Object.entries(settingsMap).map(
                                    ([key, setting]) =>
                                        shouldShowSetting(setting) && (
                                            <div
                                                key={key}
                                                className="flex flex-col space-y-2"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <Label
                                                            htmlFor={key}
                                                            className="text-sm font-medium"
                                                        >
                                                            {setting.label}
                                                        </Label>
                                                        {setting.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    setting.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    {renderInput(
                                                        key,
                                                        setting,
                                                        settingsMap,
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                )}
                            </TabsContent>
                        ),
                    )}
                </Tabs>
            </CardContent>
        </>
    );
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

function renderInput(key: string, setting: Setting, settingsMap: SettingsMap) {
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
                    <SelectTrigger className="w-[180px]">
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

export default SettingsForm;

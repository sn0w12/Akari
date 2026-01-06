"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    type Setting,
    type SettingValue,
    type CheckboxGroupSetting,
    type SliderSetting,
    type ButtonSetting,
    type ShortcutSettingKeys,
    type ShortcutSetting,
    getSettingValue,
    getDefaultSettingsValue,
} from "@/lib/settings";
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

interface SettingsInputProps {
    settingKey: string;
    setting: Setting;
    settingsMap: Record<string, Setting>;
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

export function SettingsInput({
    settingKey,
    setting,
    settingsMap,
}: SettingsInputProps) {
    if (setting.type === "custom-render") {
        return null; // Will be handled by custom renderer in the component
    }

    const renderSettingInput = () => {
        switch (setting.type) {
            case "checkbox":
                return (
                    <Switch
                        id={settingKey}
                        checked={getSettingValue(setting) as boolean}
                        onCheckedChange={(value) => {
                            setting.onChange?.(value);
                        }}
                    />
                );
            case "checkbox-group": {
                const checkboxGroupSetting = setting as CheckboxGroupSetting;
                const selectedValues = getSettingValue(setting) as string[];

                return (
                    <div className="flex flex-col space-y-2">
                        {checkboxGroupSetting.options.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-2"
                            >
                                <Label
                                    htmlFor={`${settingKey}-${option.value}`}
                                >
                                    {option.label}
                                </Label>
                                <Switch
                                    id={`${settingKey}-${option.value}`}
                                    checked={selectedValues.includes(
                                        option.value
                                    )}
                                    onCheckedChange={(checked) => {
                                        const newSelectedValues = checked
                                            ? [...selectedValues, option.value]
                                            : selectedValues.filter(
                                                  (v) => v !== option.value
                                              );
                                        setting.onChange?.(newSelectedValues);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                );
            }
            case "text":
            case "password":
            case "email":
                return (
                    <Input
                        id={settingKey}
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
                        id={settingKey}
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
                        id={settingKey}
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
                                    id={`${settingKey}-${option.value}`}
                                />
                                <Label
                                    htmlFor={`${settingKey}-${option.value}`}
                                >
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
                        id={settingKey}
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
                        <div className="flex items-center justify-between">
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
                                    "w-12 border-0 text-center font-medium"
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
                            id={settingKey}
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

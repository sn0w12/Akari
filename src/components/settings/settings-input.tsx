"use client";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { ButtonConfirmDialog } from "@/components/ui/confirm";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Input, NumberInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    type ButtonSetting,
    type CheckboxGroupSetting,
    type Setting,
    type SettingValue,
    type ShortcutSetting,
    type ShortcutSettingKeys,
    type SliderSetting,
    getDefaultSettingsValue,
    getSettingValue,
} from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Info, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SettingsInputProps {
    settingKey: string;
    setting: Setting;
    settingsMap: Record<string, Setting>;
    className?: string;
}

function findDuplicateShortcuts(
    settingsMap: Record<string, Setting>,
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
                            otherKey as ShortcutSettingKeys,
                        ),
                );
            });

            if (hasUnallowedOverlap) {
                duplicates.add(shortcutValue);
            }
        }
    });

    return duplicates;
}

function SettingInputRenderer({
    settingKey,
    setting,
    settingsMap,
}: SettingsInputProps) {
    switch (setting.type) {
        case "checkbox":
            return (
                <Switch
                    id={settingKey}
                    className="mb-0"
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
                <div className="grid grid-cols-2 gap-2 mb-0">
                    {checkboxGroupSetting.options.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center space-x-2"
                        >
                            <Label htmlFor={`${settingKey}-${option.value}`}>
                                {option.label}
                            </Label>
                            <Switch
                                id={`${settingKey}-${option.value}`}
                                className="mb-0"
                                checked={selectedValues.includes(option.value)}
                                onCheckedChange={(checked) => {
                                    const newSelectedValues = checked
                                        ? [...selectedValues, option.value]
                                        : selectedValues.filter(
                                              (v) => v !== option.value,
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
                    className="max-w-xs mb-0"
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
                    wrapperClassName="max-w-xs mb-0"
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
                    className={cn("max-w-xs mb-0", {
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
                            <SelectTrigger
                                id={settingKey}
                                className="w-48 mb-0"
                            >
                                <SelectValue placeholder={"Select an option"} />
                            </SelectTrigger>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                            <ContextMenuItem
                                onClick={() =>
                                    setting.onChange?.(
                                        getDefaultSettingsValue(setting),
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
                                                    <span>{item.label}</span>
                                                </ContextMenuItem>
                                            ),
                                        )}
                                    </>
                                )}
                        </ContextMenuContent>
                    </ContextMenu>
                    <SelectContent align="center">
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
                        setting.onChange?.(value);
                    }}
                    className="flex flex-col space-y-1 mb-0"
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
                            <Label htmlFor={`${settingKey}-${option.value}`}>
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            );
        case "shortcut": {
            const duplicates = findDuplicateShortcuts(settingsMap);
            const isDuplicate = duplicates.has(
                getSettingValue(setting) as string,
            );

            return (
                <Input
                    id={settingKey}
                    type="text"
                    value={getSettingValue(setting) as string}
                    className={`max-w-60 mb-0 ${
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
                sliderSetting.max.toString().length,
            );

            return (
                <div className="flex w-full flex-col gap-2 mb-0">
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
                                "w-12 border-0 text-center font-medium",
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
                                            sliderSetting.max,
                                        ).toString(),
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
        case "button": {
            const buttonSetting = setting as ButtonSetting;
            if (!buttonSetting.confirmation) {
                return (
                    <Button
                        onClick={() => buttonSetting.onClick?.()}
                        className="mb-0"
                    >
                        {buttonSetting.label}
                    </Button>
                );
            }

            const variant = buttonSetting.confirmVariant ?? "default";
            return (
                <ButtonConfirmDialog
                    triggerButton={
                        <Button className="mb-0">{buttonSetting.label}</Button>
                    }
                    title={"Confirm"}
                    description={buttonSetting.confirmation ?? ""}
                    onConfirm={() => buttonSetting.onClick?.()}
                    variant={variant}
                />
            );
        }
        case "color":
            return (
                <ColorPicker
                    id={settingKey}
                    value={getSettingValue(setting) as string}
                    onChange={(value: SettingValue) => {
                        setting.onChange?.(value);
                    }}
                    className="mb-0"
                />
            );
        default:
            return null;
    }
}

function SettingsInputWrapper({
    settingKey,
    setting,
    settingsMap,
    className,
}: SettingsInputProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <Label htmlFor={settingKey} className="font-medium">
                        {setting.label}
                    </Label>
                    {setting.description && (
                        <p className="text-muted-foreground text-xs">
                            {setting.description}
                        </p>
                    )}
                </div>
                {setting.tooltip && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Info className="size-4" />
                        </TooltipTrigger>
                        <TooltipContent>{setting.tooltip}</TooltipContent>
                    </Tooltip>
                )}
            </div>
            <SettingInputRenderer
                settingKey={settingKey}
                setting={setting}
                settingsMap={settingsMap}
            />
        </div>
    );
}

export function SettingsInput({
    settingKey,
    setting,
    settingsMap,
    className,
}: SettingsInputProps) {
    if (setting.type === "custom-render") {
        return null; // Will be handled by custom renderer in the component
    }

    if (setting.type === "button" || setting.type === "select") {
        return (
            <SettingsInputWrapper
                settingKey={settingKey}
                setting={setting}
                settingsMap={settingsMap}
                className={className}
            />
        );
    }

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <SettingsInputWrapper
                    settingKey={settingKey}
                    setting={setting}
                    settingsMap={settingsMap}
                    className={className}
                />
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

"use client";

import { useSettings } from "@/hooks/use-settings";
import { createSettingsMap } from "@/lib/settings";
import { Settings } from "lucide-react";
import { SettingsInput } from "../../settings/settings-input";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

export function SettingsContent() {
    const { settings, setSettings } = useSettings();
    const settingsMap = createSettingsMap("manga", settings, setSettings);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Object.entries(settingsMap).map(([key, setting]) => (
                    <div key={key} className="space-y-2">
                        <div className="flex flex-col space-y-1">
                            <Label
                                htmlFor={key}
                                className="text-sm font-medium"
                            >
                                {setting.label}
                            </Label>
                            {setting.description && (
                                <p className="text-xs text-muted-foreground">
                                    {setting.description}
                                </p>
                            )}
                        </div>
                        <div className="ml-0">
                            <SettingsInput
                                settingKey={key}
                                setting={setting}
                                settingsMap={settingsMap}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SettingsPopover({
    orientation,
}: {
    orientation: "vertical" | "horizontal";
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-7.5 md:h-9">
                    <Settings className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                side={orientation === "vertical" ? "left" : "bottom"}
                align="end"
                className="w-screen sm:w-128 max-h-96 overflow-y-auto"
                data-scrollbar-custom
            >
                <SettingsContent />
            </PopoverContent>
        </Popover>
    );
}

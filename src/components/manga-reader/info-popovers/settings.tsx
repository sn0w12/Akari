"use client";

import { useSettings } from "@/hooks/use-settings";
import { createSettingsMap } from "@/lib/settings";
import { Button } from "../../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../../ui/popover";
import { Settings } from "lucide-react";
import { SettingsInput } from "../../settings/settings-input";
import { Label } from "../../ui/label";

export function SettingsPopover({
    orientation,
}: {
    orientation: "vertical" | "horizontal";
}) {
    const { settings, setSettings } = useSettings();
    const settingsMap = createSettingsMap("manga", settings, setSettings);

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
                className="w-auto sm:w-128 max-h-96 overflow-y-auto"
            >
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
            </PopoverContent>
        </Popover>
    );
}

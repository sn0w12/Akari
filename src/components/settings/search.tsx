"use client";

import { useSettings } from "@/hooks/use-settings";
import { createAllSettingsMaps, Setting } from "@/lib/settings";
import { SettingsInput } from "./settings-input";
import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function SettingsSearch() {
    const { settings, setSettings } = useSettings();
    const [searchQuery, setSearchQuery] = React.useState("");

    const settingsMaps = createAllSettingsMaps(settings, setSettings);
    const groupedSearchResults = React.useMemo(() => {
        const allSettingsForSearch: Array<{
            group: string;
            key: string;
            setting: Setting;
        }> = [];
        Object.entries(settingsMaps).forEach(([groupName, groupSettings]) => {
            if (groupName.toLowerCase() === "search") return;
            Object.entries(groupSettings).forEach(([key, setting]) => {
                if (key === "label") return;
                allSettingsForSearch.push({
                    group: groupName,
                    key,
                    setting: setting as Setting,
                });
            });
        });

        const q = searchQuery.toLowerCase();
        const searchResults = searchQuery.trim()
            ? allSettingsForSearch.filter(
                  ({ key, setting }) =>
                      key.toLowerCase().includes(q) ||
                      (setting.label &&
                          setting.label.toLowerCase().includes(q)) ||
                      (setting.description &&
                          setting.description.toLowerCase().includes(q))
              )
            : [];

        const grouped: Record<
            string,
            Array<{ key: string; setting: Setting }>
        > = {};
        searchResults.forEach(({ group, key, setting }) => {
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push({ key, setting });
        });
        return grouped;
    }, [searchQuery, settingsMaps]);

    return (
        <>
            <div className="mb-6 flex flex-col gap-2">
                <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search settings by name, description, or key..."
                />
            </div>
            {(() => {
                if (searchQuery.trim() === "") {
                    return (
                        <p className="text-muted-foreground text-sm">
                            Enter text to search for settings.
                        </p>
                    );
                }
                if (Object.keys(groupedSearchResults).length === 0) {
                    return (
                        <p className="text-muted-foreground text-sm">
                            No results found for &quot;{searchQuery}&quot;.
                        </p>
                    );
                }
                return (
                    <div className="space-y-8">
                        {Object.entries(groupedSearchResults).map(
                            ([groupName, settingsArr]) => (
                                <div key={groupName} className="space-y-4">
                                    <h3 className="bg-card sticky top-36 z-20 border-b pb-2 text-lg font-medium">
                                        {groupName.charAt(0).toUpperCase() +
                                            groupName.slice(1)}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4">
                                        {settingsArr.map(({ key, setting }) => (
                                            <div
                                                key={key}
                                                className="space-y-2"
                                            >
                                                <div className="flex flex-col space-y-1">
                                                    <Label
                                                        htmlFor={key}
                                                        className="font-medium"
                                                    >
                                                        {setting.label}
                                                    </Label>
                                                    {setting.description && (
                                                        <p className="text-muted-foreground text-xs">
                                                            {
                                                                setting.description
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-1">
                                                    <SettingsInput
                                                        settingKey={key}
                                                        setting={
                                                            setting as Setting
                                                        }
                                                        settingsMap={
                                                            settingsMaps[
                                                                groupName
                                                            ]
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                );
            })()}
        </>
    );
}

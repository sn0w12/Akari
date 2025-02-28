"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { CardContent, Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { createAllSettingsMaps } from "@/lib/settings";
import { Setting, SettingsMap } from "@/components/ui/Header/Settings";
import { renderInput } from "@/components/ui/Header/Settings";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
    const { settings, setSettings } = useSettings();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<string | null>(null);
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

    const settingsMap = useMemo(
        () => createAllSettingsMaps(settings, setSettings),
        [settings, setSettings],
    );

    const allSettingsList = useMemo(() => {
        const list: {
            category: string;
            key: string;
            setting: Setting;
            match: string;
        }[] = [];

        Object.entries(settingsMap).forEach(([category, settings]) => {
            Object.entries(settings).forEach(([key, setting]) => {
                // Check if setting is a valid object with required properties
                if (
                    setting &&
                    typeof setting === "object" &&
                    !Array.isArray(setting) &&
                    "label" in setting &&
                    typeof setting.label === "string"
                ) {
                    const matchText =
                        `${category} ${setting.label} ${setting.description || ""}`.toLowerCase();
                    list.push({
                        category,
                        key,
                        setting: setting as Setting,
                        match: matchText,
                    });
                }
            });
        });

        return list;
    }, [settingsMap]);

    const filteredSettings = useMemo(() => {
        if (!searchQuery.trim()) return null;

        const query = searchQuery.toLowerCase();
        const results = allSettingsList.filter(
            (item) =>
                item.match.includes(query) &&
                Object.keys(item.setting).length > 0 &&
                typeof item.setting === "object" &&
                !Array.isArray(item.setting),
        );

        return results;
    }, [searchQuery, allSettingsList]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.trim() && activeTab) {
            setActiveTab(null);
        } else if (!e.target.value.trim() && !activeTab) {
            setActiveTab(Object.keys(settingsMap)[0]);
        }
    };

    useEffect(() => {
        if (!activeTab && Object.keys(settingsMap).length > 0) {
            setActiveTab(Object.keys(settingsMap)[0]);
        }
    }, [activeTab, settingsMap]);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search settings..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10"
                />
            </div>

            {filteredSettings ? (
                <div className="space-y-8">
                    <h2 className="text-xl font-semibold">Search Results</h2>
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            {filteredSettings.length > 0 ? (
                                filteredSettings.map(
                                    ({ category, key, setting }) => (
                                        <div
                                            key={`${category}-${key}`}
                                            className="border-b pb-4 last:border-b-0 last:pb-0"
                                        >
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <Label
                                                            htmlFor={key}
                                                            className="text-sm font-medium"
                                                        >
                                                            {setting.label}
                                                            <span className="text-xs ml-2 text-muted-foreground">
                                                                ({category})
                                                            </span>
                                                        </Label>
                                                        {setting.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {
                                                                    setting.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {renderInput(
                                                            key,
                                                            setting,
                                                            settingsMap[
                                                                category
                                                            ] as SettingsMap,
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    No settings found matching "{searchQuery}"
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="bg-background rounded-lg border shadow">
                    <Tabs
                        value={activeTab || ""}
                        onValueChange={setActiveTab}
                        className="w-full"
                    >
                        <div className="border-b px-4">
                            <TabsList className="flex flex-wrap h-auto gap-2 w-full justify-center md:justify-start py-2 bg-transparent">
                                {Object.keys(settingsMap).map((category) => (
                                    <TabsTrigger
                                        key={category}
                                        value={category}
                                        className="data-[state=active]:bg-accent rounded-md px-3 py-1.5 hover:bg-accent/70 flex-shrink-0"
                                    >
                                        {category}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <div className="p-6">
                            {Object.entries(settingsMap).map(
                                ([category, categorySettings]) => (
                                    <TabsContent
                                        key={category}
                                        value={category}
                                        className="mt-0"
                                    >
                                        <div className="space-y-6">
                                            {Object.entries(categorySettings)
                                                .slice(1)
                                                .map(
                                                    ([key, setting], index) =>
                                                        shouldShowSetting(
                                                            setting,
                                                        ) && (
                                                            <div
                                                                key={key}
                                                                className="border-b pb-4 last:border-b-0 last:pb-0"
                                                            >
                                                                <div className="flex flex-col space-y-2">
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <Label
                                                                                htmlFor={
                                                                                    key
                                                                                }
                                                                                className="text-sm font-medium"
                                                                            >
                                                                                {
                                                                                    setting.label
                                                                                }
                                                                            </Label>
                                                                            {setting.description && (
                                                                                <p className="text-sm text-muted-foreground">
                                                                                    {
                                                                                        setting.description
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            {renderInput(
                                                                                key,
                                                                                setting as Setting,
                                                                                categorySettings as SettingsMap,
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                )}
                                        </div>
                                    </TabsContent>
                                ),
                            )}
                        </div>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

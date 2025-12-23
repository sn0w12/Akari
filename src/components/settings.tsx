"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import {
    createAllSettingsMaps,
    CustomRenderSettingKeys,
    defaultSettings,
    resetAllSettingsToDefault,
    Setting,
    shouldShowSetting,
} from "@/lib/settings";
import { SettingsInput } from "@/components/settings/settings-input";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/contexts/confirm-context";
import { useDevice } from "@/contexts/device-context";
import { Tree, TreeItem } from "@/components/ui/tree";
import { useSticky } from "@/hooks/use-sticky";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { TableOfContents } from "lucide-react";
import { APP_SETTINGS } from "@/config";

import { SettingsSearch } from "@/components/settings/search";

interface HierarchicalGroup {
    settings: Record<string, Setting>;
    subgroups: Record<string, Record<string, Setting>>;
}

export default function SettingsPage() {
    const { settings, setSettings } = useSettings();
    const { confirm } = useConfirm();
    const { deviceType, isPWA } = useDevice();

    const allSettingsMaps = createAllSettingsMaps(settings, setSettings);
    const settingsMaps = React.useMemo(() => {
        const filtered: Record<string, Record<string, Setting>> = {};

        Object.entries(allSettingsMaps).forEach(
            ([categoryLabel, settingsMap]) => {
                const categoryKey = Object.keys(APP_SETTINGS).find(
                    (key) =>
                        APP_SETTINGS[key as keyof typeof APP_SETTINGS].label ===
                        categoryLabel
                );

                if (categoryKey) {
                    const category =
                        APP_SETTINGS[categoryKey as keyof typeof APP_SETTINGS];
                    const categoryVisibility =
                        "visibility" in category
                            ? category.visibility
                            : undefined;
                    if (
                        !shouldShowSetting(
                            categoryVisibility,
                            deviceType,
                            isPWA
                        )
                    ) {
                        return; // Skip this entire category
                    }
                }

                // Filter individual settings within the category
                const filteredSettings: Record<string, Setting> = {};
                Object.entries(settingsMap).forEach(([key, setting]) => {
                    if (
                        shouldShowSetting(setting.visibility, deviceType, isPWA)
                    ) {
                        filteredSettings[key] = setting;
                    }
                });

                // Only include the category if it has visible settings
                if (Object.keys(filteredSettings).length > 0) {
                    filtered[categoryLabel] = filteredSettings;
                }
            }
        );

        return filtered;
    }, [allSettingsMaps, deviceType, isPWA]);

    const firstTab = Object.keys(settingsMaps)[0];
    const [activeTab, setActiveTab] = React.useState(firstTab);
    const [stickyRef, isSticky] = useSticky(-16);
    const [activeSection, setActiveSection] = React.useState<string | null>(
        null
    );

    const customRenderers: Record<CustomRenderSettingKeys, React.ReactNode> = {
        settingsSearch: <SettingsSearch />,
    };

    const tocTree = React.useMemo(() => {
        const settingsMap = settingsMaps[activeTab];
        if (!settingsMap) return null;

        // Collect hierarchical groups
        const hierarchicalGroups: Record<string, HierarchicalGroup> = {};
        Object.entries(settingsMap).forEach(([key, setting]) => {
            if (key === "label") return;
            if (setting.groups && setting.groups.length > 0) {
                const parentGroup = setting.groups[0];
                if (!hierarchicalGroups[parentGroup]) {
                    hierarchicalGroups[parentGroup] = {
                        settings: {},
                        subgroups: {},
                    };
                }
                if (setting.groups.length === 1) {
                    hierarchicalGroups[parentGroup].settings[key] = setting;
                } else {
                    // Use all group names after the parent as a joined string for uniqueness
                    const subgroupPath = setting.groups.slice(1).join(" > ");
                    if (
                        !hierarchicalGroups[parentGroup].subgroups[subgroupPath]
                    ) {
                        hierarchicalGroups[parentGroup].subgroups[
                            subgroupPath
                        ] = {};
                    }
                    hierarchicalGroups[parentGroup].subgroups[subgroupPath][
                        key
                    ] = setting;
                }
            }
        });

        // Build tree items
        return Object.entries(hierarchicalGroups).map(
            ([groupName, groupData]) => (
                <TreeItem
                    key={groupName}
                    label={groupName}
                    collapsible={Object.keys(groupData.subgroups).length > 0}
                    defaultCollapsed={false}
                    onClick={() => {
                        const el = document.getElementById(
                            `settings-section-${groupName}`
                        );
                        if (el) {
                            el.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                            setActiveSection(groupName);
                        }
                    }}
                    active={activeSection === groupName}
                >
                    {Object.entries(groupData.subgroups).map(
                        ([subgroupPath]) => (
                            <TreeItem
                                key={subgroupPath}
                                label={subgroupPath}
                                onClick={() => {
                                    const el = document.getElementById(
                                        `settings-subsection-${groupName}__${subgroupPath}`
                                    );
                                    if (el) {
                                        el.scrollIntoView({
                                            behavior: "smooth",
                                            block: "start",
                                        });
                                        setActiveSection(
                                            `${groupName}__${subgroupPath}`
                                        );
                                    }
                                }}
                                active={
                                    activeSection ===
                                    `${groupName}__${subgroupPath}`
                                }
                            />
                        )
                    )}
                </TreeItem>
            )
        );
    }, [settingsMaps, activeTab, activeSection]);

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Settings</h1>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                        await confirm({
                            title: "Reset",
                            description:
                                "Are you sure you want to reset all settings to their default values?",
                            confirmText: "Reset",
                            cancelText: "Cancel",
                            variant: "destructive",
                        });
                        resetAllSettingsToDefault();
                        setSettings(defaultSettings);
                    }}
                >
                    Reset
                </Button>
            </div>

            <Tabs
                defaultValue="General"
                value={activeTab}
                onValueChange={(tab) => {
                    setActiveTab(tab);
                    setActiveSection(null);
                }}
                className="w-full gap-0"
            >
                <TabsList
                    ref={stickyRef}
                    className={`bg-background sticky top-0 z-40 py-4 ${
                        isSticky ? "settings-tabs-sticky border-b" : ""
                    }`}
                >
                    {Object.keys(settingsMaps).map((groupName, index) => (
                        <TabsTrigger
                            key={groupName}
                            index={index}
                            value={groupName}
                        >
                            {groupName.charAt(0).toUpperCase() +
                                groupName.slice(1)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Render all settings tabs from settings maps */}
                {Object.entries(settingsMaps).map(
                    ([groupName, settingsMap]) => (
                        <TabsContent key={groupName} value={groupName}>
                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr]">
                                <Card className="gap-0 pt-0">
                                    <CardHeader className="bg-card sticky top-16 z-30 flex flex-row items-center justify-between rounded-xl py-3">
                                        <CardTitle className="w-full">
                                            <h2 className="w-full border-b pt-3 pb-2 text-2xl font-medium">
                                                {groupName
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    groupName.slice(1)}
                                            </h2>
                                        </CardTitle>
                                        {/* ToC Popover Button */}
                                        {tocTree && tocTree.length > 0 ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="absolute top-4 right-6 h-8 w-8 p-0"
                                                        aria-label="Table of Contents"
                                                    >
                                                        <TableOfContents className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent
                                                    className="w-64 p-0"
                                                    align="end"
                                                    side="bottom"
                                                >
                                                    <div className="p-2">
                                                        <Tree>{tocTree}</Tree>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        ) : null}
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            // Check if this tab contains only a single custom rendered setting
                                            const customSettingKeys =
                                                Object.entries(settingsMap)
                                                    .filter(
                                                        ([, setting]) =>
                                                            setting.type ===
                                                            "custom-render"
                                                    )
                                                    .map(([key]) => key);
                                            const totalSettingKeys =
                                                Object.keys(settingsMap).filter(
                                                    (k) => k !== "label"
                                                );
                                            const onlySingleCustom =
                                                customSettingKeys.length ===
                                                    1 &&
                                                totalSettingKeys.length === 1;
                                            if (onlySingleCustom) {
                                                // Render the single custom setting directly, no grid or aside
                                                const key =
                                                    customSettingKeys[0];
                                                const setting = settingsMap[
                                                    key
                                                ] as Setting;
                                                return (
                                                    <div className="space-y-2">
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
                                                            {
                                                                customRenderers[
                                                                    key as keyof typeof customRenderers
                                                                ]
                                                            }
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            // Otherwise, render grid and aside as before
                                            return (
                                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr]">
                                                    {/* Settings content (left) */}
                                                    <div>
                                                        {(() => {
                                                            // First, collect all settings that have groups
                                                            const settingsWithGroups: Record<
                                                                string,
                                                                Setting
                                                            > = {};
                                                            const settingsWithoutGroups: Record<
                                                                string,
                                                                Setting
                                                            > = {};

                                                            // Separate settings with and without groups
                                                            Object.entries(
                                                                settingsMap
                                                            ).forEach(
                                                                ([
                                                                    key,
                                                                    setting,
                                                                ]) => {
                                                                    if (
                                                                        key ===
                                                                        "label"
                                                                    )
                                                                        return;

                                                                    if (
                                                                        setting.groups &&
                                                                        setting
                                                                            .groups
                                                                            .length >
                                                                            0
                                                                    ) {
                                                                        settingsWithGroups[
                                                                            key
                                                                        ] =
                                                                            setting as Setting;
                                                                    } else {
                                                                        settingsWithoutGroups[
                                                                            key
                                                                        ] =
                                                                            setting as Setting;
                                                                    }
                                                                }
                                                            );

                                                            // Create hierarchical structure
                                                            const hierarchicalGroups: Record<
                                                                string,
                                                                HierarchicalGroup
                                                            > = {};

                                                            // Process settings with groups
                                                            Object.entries(
                                                                settingsWithGroups
                                                            ).forEach(
                                                                ([
                                                                    key,
                                                                    setting,
                                                                ]) => {
                                                                    const groups =
                                                                        setting.groups as string[];

                                                                    // Assume the first group is always the parent
                                                                    const parentGroup =
                                                                        groups[0];

                                                                    // Initialize parent group if it doesn't exist
                                                                    if (
                                                                        !hierarchicalGroups[
                                                                            parentGroup
                                                                        ]
                                                                    ) {
                                                                        hierarchicalGroups[
                                                                            parentGroup
                                                                        ] = {
                                                                            settings:
                                                                                {},
                                                                            subgroups:
                                                                                {},
                                                                        };
                                                                    }

                                                                    if (
                                                                        groups.length ===
                                                                        1
                                                                    ) {
                                                                        // This setting belongs directly to the parent group
                                                                        hierarchicalGroups[
                                                                            parentGroup
                                                                        ].settings[
                                                                            key
                                                                        ] =
                                                                            setting;
                                                                    } else {
                                                                        // This setting belongs to a subgroup
                                                                        for (
                                                                            let i = 1;
                                                                            i <
                                                                            groups.length;
                                                                            i++
                                                                        ) {
                                                                            const subgroup =
                                                                                groups[
                                                                                    i
                                                                                ];

                                                                            // Initialize subgroup if it doesn't exist
                                                                            if (
                                                                                !hierarchicalGroups[
                                                                                    parentGroup
                                                                                ]
                                                                                    .subgroups[
                                                                                    subgroup
                                                                                ]
                                                                            ) {
                                                                                hierarchicalGroups[
                                                                                    parentGroup
                                                                                ].subgroups[
                                                                                    subgroup
                                                                                ] =
                                                                                    {};
                                                                            }

                                                                            // Add setting to subgroup
                                                                            hierarchicalGroups[
                                                                                parentGroup
                                                                            ].subgroups[
                                                                                subgroup
                                                                            ][
                                                                                key
                                                                            ] =
                                                                                setting;
                                                                        }
                                                                    }
                                                                }
                                                            );

                                                            // Function to render a group of settings
                                                            const renderSettingsGroup =
                                                                (
                                                                    groupSettings: Record<
                                                                        string,
                                                                        Setting
                                                                    >
                                                                ) => {
                                                                    return (
                                                                        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:!grid-cols-2 lg:!grid-cols-3 xl:!grid-cols-4">
                                                                            {Object.entries(
                                                                                groupSettings
                                                                            ).map(
                                                                                ([
                                                                                    key,
                                                                                    setting,
                                                                                ]) => {
                                                                                    // For certain settings that should span the full width
                                                                                    const isFullWidth =
                                                                                        setting.type ===
                                                                                            "custom-render" ||
                                                                                        setting.type ===
                                                                                            "textarea" ||
                                                                                        groupName.toLowerCase() ===
                                                                                            "about";

                                                                                    return (
                                                                                        <div
                                                                                            key={
                                                                                                key
                                                                                            }
                                                                                            className={`space-y-2 ${
                                                                                                isFullWidth
                                                                                                    ? "col-span-full"
                                                                                                    : ""
                                                                                            }`}
                                                                                        >
                                                                                            <div className="flex flex-col space-y-1">
                                                                                                <Label
                                                                                                    htmlFor={
                                                                                                        key
                                                                                                    }
                                                                                                    className="font-medium"
                                                                                                >
                                                                                                    {
                                                                                                        setting.label
                                                                                                    }
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
                                                                                                {setting.type ===
                                                                                                "custom-render" ? (
                                                                                                    customRenderers[
                                                                                                        key as keyof typeof customRenderers
                                                                                                    ]
                                                                                                ) : (
                                                                                                    <SettingsInput
                                                                                                        settingKey={
                                                                                                            key
                                                                                                        }
                                                                                                        setting={
                                                                                                            setting as Setting
                                                                                                        }
                                                                                                        settingsMap={
                                                                                                            settingsMap
                                                                                                        }
                                                                                                    />
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            )}
                                                                        </div>
                                                                    );
                                                                };

                                                            return (
                                                                <div className="space-y-8">
                                                                    {/* Render ungrouped settings first if they exist */}
                                                                    {Object.keys(
                                                                        settingsWithoutGroups
                                                                    ).length >
                                                                        0 && (
                                                                        <div className="space-y-4">
                                                                            {renderSettingsGroup(
                                                                                settingsWithoutGroups
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {/* Render hierarchical groups */}
                                                                    {Object.entries(
                                                                        hierarchicalGroups
                                                                    ).map(
                                                                        ([
                                                                            groupName,
                                                                            groupData,
                                                                        ]) => (
                                                                            <div
                                                                                key={
                                                                                    groupName
                                                                                }
                                                                                className="space-y-4"
                                                                                id={`settings-section-${groupName}`}
                                                                                style={{
                                                                                    scrollMarginTop:
                                                                                        "150px",
                                                                                }} // adjust for sticky header
                                                                            >
                                                                                {/* Sticky main group header */}
                                                                                <h3 className="bg-card sticky top-34 z-20 border-b pb-2 text-lg font-medium">
                                                                                    {
                                                                                        groupName
                                                                                    }
                                                                                </h3>

                                                                                {/* Main group settings */}
                                                                                {Object.keys(
                                                                                    groupData.settings
                                                                                )
                                                                                    .length >
                                                                                    0 &&
                                                                                    renderSettingsGroup(
                                                                                        groupData.settings
                                                                                    )}

                                                                                {/* Subgroups */}
                                                                                {Object.entries(
                                                                                    groupData.subgroups
                                                                                ).map(
                                                                                    ([
                                                                                        subgroupPath,
                                                                                        subgroupSettings,
                                                                                    ]) => (
                                                                                        <div
                                                                                            key={
                                                                                                subgroupPath
                                                                                            }
                                                                                            className="border-muted mt-6 space-y-4 border-l-2 pt-1 pl-4"
                                                                                            id={`settings-subsection-${groupName}__${subgroupPath}`}
                                                                                            style={{
                                                                                                scrollMarginTop:
                                                                                                    "170px",
                                                                                            }}
                                                                                        >
                                                                                            {/* Sticky subgroup header */}
                                                                                            <h4 className="text-md bg-card sticky top-43 z-10 flex items-center pt-1 font-medium">
                                                                                                {
                                                                                                    subgroupPath
                                                                                                }
                                                                                            </h4>

                                                                                            {/* Subgroup settings */}
                                                                                            {renderSettingsGroup(
                                                                                                subgroupSettings
                                                                                            )}
                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    )
                )}
            </Tabs>
        </div>
    );
}

"use client";

import { CardContent } from "@/components/ui/card";
import { DialogHeader, DialogTitle } from "../dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSettingsDialog } from "@/hooks/useSettingsDialog";
import { useSidebar } from "@/hooks/useSidebar";
import { renderInput, Setting, SettingsMap } from "@/lib/settings";

interface SettingsFormProps {
    settingsTabs: Record<string, SettingsMap>;
}

function SettingsForm({ settingsTabs }: SettingsFormProps) {
    const defaultTab = Object.keys(settingsTabs)[0];
    const isProduction = process.env.NODE_ENV === "production";
    const { closeSettings } = useSettingsDialog();
    const { closeSidebar } = useSidebar();

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
                <Link
                    href="/settings"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                        closeSettings();
                        closeSidebar();
                    }}
                >
                    Open in full page
                </Link>
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
                                                            <p
                                                                className="text-sm text-muted-foreground settings-description"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: setting.description,
                                                                }}
                                                            />
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

export default SettingsForm;

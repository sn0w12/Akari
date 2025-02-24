"use client";

import { useState, useEffect, useCallback, useMemo, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import SettingsForm from "./Settings";
import {
    dispatchSettingsChange,
    SettingsInterface,
    defaultSettings,
    createAllSettingsMaps,
} from "@/lib/settings";

const useSettings = () => {
    const [settings, setSettingsState] = useState<SettingsInterface>(() => {
        if (typeof window !== "undefined") {
            const storedSettings = localStorage.getItem("settings");
            return storedSettings
                ? JSON.parse(storedSettings)
                : defaultSettings;
        }
        return defaultSettings;
    });

    const setSettings = useCallback(
        (
            newSettings:
                | SettingsInterface
                | ((prev: SettingsInterface) => SettingsInterface),
        ) => {
            setSettingsState((prevSettings) => {
                const nextSettings =
                    typeof newSettings === "function"
                        ? newSettings(prevSettings)
                        : newSettings;

                // Defer events to next tick to avoid render-time updates
                setTimeout(() => {
                    Object.keys(nextSettings).forEach((key) => {
                        const typedKey = key as keyof SettingsInterface;
                        const newValue = nextSettings[typedKey];
                        const oldValue = prevSettings[typedKey];

                        if (oldValue !== newValue) {
                            dispatchSettingsChange(
                                typedKey,
                                newValue,
                                oldValue,
                            );
                        }
                    });
                }, 0);

                return nextSettings;
            });
        },
        [],
    );

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("settings", JSON.stringify(settings));
        }
    }, [settings]);

    return { settings, setSettings };
};

const SettingsDialog = forwardRef<HTMLButtonElement>((props, ref) => {
    const { settings, setSettings } = useSettings();
    const settingsMap = useMemo(
        () => createAllSettingsMaps(settings, setSettings),
        [settings, setSettings],
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex w-full sm:w-auto flex-grow items-center gap-3 px-4 py-2 border rounded-md"
                    ref={ref}
                >
                    <Settings className="h-5 w-5" />
                    <span className="text-base font-medium">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <SettingsForm settingsTabs={settingsMap} />
            </DialogContent>
        </Dialog>
    );
});

export default SettingsDialog;

import { useState, useEffect, useCallback } from "react";
import {
    dispatchSettingsChange,
    SettingsInterface,
    defaultSettings,
} from "@/lib/settings";

export const useSettings = () => {
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
                | ((prev: SettingsInterface) => SettingsInterface)
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
                                oldValue
                            );
                        }
                    });
                }, 0);

                return nextSettings;
            });
        },
        []
    );

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("settings", JSON.stringify(settings));
        }
    }, [settings]);

    return { settings, setSettings };
};

import { defaultSettings, SettingsInterface } from "@/components/Header";

export function getSetting(key: keyof SettingsInterface) {
    if (typeof window !== "undefined") {
        const storedSetting = localStorage.getItem("settings");
        if (storedSetting) {
            const settings = JSON.parse(storedSetting);
            return settings[key] || defaultSettings[key];
        }
    }
    return null;
}

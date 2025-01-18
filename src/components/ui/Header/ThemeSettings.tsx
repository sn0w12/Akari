"use client";

import { useTheme } from "next-themes";
import { useSettingsChange } from "@/lib/settings";

export function ThemeSetting() {
    const { theme, setTheme } = useTheme();

    useSettingsChange((event) => {
        setTheme(String(event.detail.value));
    }, "theme");

    return null;
}

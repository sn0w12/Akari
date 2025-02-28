"use client";

import { useMemo, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import SettingsForm from "./Settings";
import { createAllSettingsMaps } from "@/lib/settings";
import { useSettings } from "@/hooks/useSettings";
import { useSettingsDialog } from "@/hooks/useSettingsDialog";

const SettingsDialog = forwardRef<HTMLButtonElement>((props, ref) => {
    const { settings, setSettings } = useSettings();
    const { isSettingsOpen, toggleSettings } = useSettingsDialog();
    const settingsMap = useMemo(
        () => createAllSettingsMaps(settings, setSettings),
        [settings, setSettings],
    );

    return (
        <Dialog open={isSettingsOpen} onOpenChange={toggleSettings}>
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

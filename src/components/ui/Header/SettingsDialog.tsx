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
            <DialogContent>
                <SettingsForm settingsTabs={settingsMap} />
            </DialogContent>
        </Dialog>
    );
});

export default SettingsDialog;

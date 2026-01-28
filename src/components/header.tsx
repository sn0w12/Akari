"use client";

import { useWindowWidth } from "@/hooks/use-window-width";
import { DesktopHeader } from "./header/desktop-header";
import { MobileHeader } from "./header/mobile-header";
import { useTheme } from "next-themes";
import { useSetting, useSettingsChange } from "@/lib/settings";
import { useEffect } from "react";
import Toast from "@/lib/toast-wrapper";
import { validateSecondaryAccounts } from "@/lib/auth/secondary-accounts";
import { useUser } from "@/contexts/user-context";

interface HeaderProps {
    notification: string;
}

export function HeaderComponent({ notification }: HeaderProps) {
    const { user } = useUser();
    const { setTheme } = useTheme();
    const windowWidth = useWindowWidth();
    const validNotifs = useSetting("groupLoginToasts") as string[];

    useSettingsChange((event) => {
        setTheme(String(event.detail.value));
    }, "theme");

    useEffect(() => {
        if (!user || !validNotifs) return;

        async function validate() {
            const validated = await validateSecondaryAccounts();
            for (const account of validated) {
                if (validNotifs.includes(account.id) && !account.valid) {
                    new Toast(`${account.name} session has expired.`, "error", {
                        description:
                            "You can disable this notification in settings.",
                    });
                }
            }
        }
        validate();
    }, [user, validNotifs]);

    return (
        <>
            {windowWidth < 768 && windowWidth !== 0 ? (
                <MobileHeader />
            ) : (
                <DesktopHeader notification={notification} />
            )}
        </>
    );
}

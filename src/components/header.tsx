import { useUser } from "@/hooks/use-user";
import { validateSecondaryAccounts } from "@/lib/auth/secondary-accounts";
import { useSetting, useSettingsChange } from "@/lib/settings";
import { toastManager } from "@/components/ui/toast";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { DesktopHeader } from "./header/desktop-header";
import { MobileHeader } from "./header/mobile-header";

interface HeaderProps {
    notification: string;
}

export function HeaderComponent({ notification }: HeaderProps) {
    const { data: user } = useUser();
    const { setTheme } = useTheme();
    const validNotifs = useSetting("groupLoginToasts") as string[];

    useSettingsChange((event) => {
        if (typeof event.detail.value === "string") {
            setTheme(event.detail.value);
        }
    }, "theme");

    useEffect(() => {
        if (!user || !validNotifs) return;

        async function validate() {
            const validated = await validateSecondaryAccounts();
            const validNotifsSet = new Set(validNotifs);
            for (const account of validated) {
                if (validNotifsSet.has(account.id) && !account.valid) {
                    toastManager.add({
                        title: `${account.name} session has expired.`,
                        type: "error",
                        description:
                            "You can disable this notification in settings.",
                    });
                }
            }
        }
        void validate();
    }, [user, validNotifs]);

    return (
        <>
            <MobileHeader />
            <DesktopHeader notification={notification} />
        </>
    );
}

import { useUser } from "@/contexts/user-context";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { SidebarMenuLink } from "../ui/sidebar";
import { KeyboardShortcut } from "../ui/keyboard-shortcut";
import { Avatar } from "../ui/avatar";
import { User } from "lucide-react";
import router from "next/router";

export function AccountButton({
    sidebarCollapsed,
}: {
    sidebarCollapsed: boolean;
}) {
    const { user } = useUser();
    const openAccount = useSetting("openAccount");
    useShortcutSetting("openAccount", () => router.push("/account"), {
        preventDefault: true,
    });

    return (
        <>
            {user ? (
                <SidebarMenuLink tooltip="Account" href="/account">
                    <Avatar name={user.username} size={24} />
                    <span>Account</span>
                    <KeyboardShortcut
                        keys={openAccount}
                        className={`gap-1 transition-opacity transition-duration-200 ${
                            sidebarCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                    />
                </SidebarMenuLink>
            ) : (
                <SidebarMenuLink tooltip="Login" href="/auth/login">
                    <User />
                    <span>Login</span>
                    <KeyboardShortcut
                        keys={openAccount}
                        className={`gap-1 transition-opacity transition-duration-200 ${
                            sidebarCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                    />
                </SidebarMenuLink>
            )}
        </>
    );
}

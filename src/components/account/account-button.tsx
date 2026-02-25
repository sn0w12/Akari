import { useUser } from "@/hooks/use-user";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { User } from "lucide-react";
import router from "next/router";
import { Avatar } from "../ui/avatar";
import { KeyboardShortcut } from "../ui/keyboard-shortcut";
import { SidebarMenuLink } from "../ui/sidebar";

export function AccountButton({
    sidebarCollapsed,
}: {
    sidebarCollapsed: boolean;
}) {
    const { data: user } = useUser();
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
                        className={`transition-opacity ease-snappy ${
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
                        className={`transition-opacity ease-snappy ${
                            sidebarCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                    />
                </SidebarMenuLink>
            )}
        </>
    );
}

import { useUser } from "@/hooks/use-user";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { User } from "lucide-react";
import { Avatar } from "../ui/avatar";
import { KeyboardShortcut } from "../ui/keyboard-shortcut";
import { SidebarMenuLink } from "../ui/sidebar";

export function AccountButton({
    isSidebarCollapsed,
}: {
    isSidebarCollapsed: boolean;
}) {
    const { data: user } = useUser();
    const openAccount = useSetting("openAccount");
    const router = useRouter();
    const pathname = useRouterState({ select: (s) => s.location.pathname });

    useShortcutSetting(
        "openAccount",
        () => router.navigate({ to: "/account" }),
        {
            preventDefault: true,
        },
    );

    return (
        <>
            {user ? (
                <SidebarMenuLink
                    tooltip="Account"
                    to="/account"
                    active={pathname.startsWith("/account")}
                >
                    <Avatar name={user.username} size={24} />
                    <span>Account</span>
                    <KeyboardShortcut
                        keys={openAccount}
                        className={`transition-opacity ease-snappy ${
                            isSidebarCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                    />
                </SidebarMenuLink>
            ) : (
                <SidebarMenuLink
                    tooltip="Login"
                    to="/auth/login"
                    active={pathname.startsWith("/auth")}
                >
                    <User />
                    <span>Login</span>
                    <KeyboardShortcut
                        keys={openAccount}
                        className={`transition-opacity ease-snappy ${
                            isSidebarCollapsed ? "opacity-0" : "opacity-100"
                        }`}
                    />
                </SidebarMenuLink>
            )}
        </>
    );
}

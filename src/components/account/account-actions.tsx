import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardPanel,
    CardTitle,
} from "@/components/ui/card";
import { toastManager } from "@/components/ui/toast";
import { env } from "@/lib/env";
import { exportBookmarks } from "@/lib/manga/export-bookmarks";
import { registerAndSubscribe } from "@/lib/notifications/subscribe";
import { StorageManager } from "@/lib/storage";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Clipboard, Download, RefreshCcw } from "lucide-react";
import { useState } from "react";

type User = components["schemas"]["UserResponse"];

interface AccountActionsProps {
    user: User;
}

export function AccountActions({ user }: AccountActionsProps) {
    const queryClient = useQueryClient();
    const [isExportingBookmarks, setIsExportingBookmarks] = useState(false);
    const [isEnablingNotifications, setIsEnablingNotifications] =
        useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    async function handleExportBookmarks() {
        setIsExportingBookmarks(true);

        try {
            const count = await exportBookmarks();
            toastManager.add({
                title: "Bookmarks exported",
                description: `${count} bookmark${count === 1 ? "" : "s"} saved to JSON.`,
                type: "success",
            });
        } catch (error) {
            console.error("Failed to export bookmarks", error);
            toastManager.add({
                title: "Export failed",
                description: "Akari could not export your bookmarks.",
                type: "error",
            });
        } finally {
            setIsExportingBookmarks(false);
        }
    }

    async function handleEnableNotifications() {
        setIsEnablingNotifications(true);

        try {
            const result = await registerAndSubscribe(
                env("VITE_VAPID_PUBLIC_KEY") || "",
            );
            const storage = StorageManager.get("pushNotifications");

            if (result.status === "subscribed") {
                storage.update({
                    declined: false,
                    enabled: true,
                    pending: false,
                });
                toastManager.add({
                    title: "Notifications enabled",
                    description:
                        "Akari will notify you when bookmarked manga update.",
                    type: "success",
                });
            } else {
                storage.update({
                    declined: false,
                    pending: true,
                });
                toastManager.add({
                    title: "Notifications pending",
                    description:
                        "Akari will finish setup when push keys are available.",
                    type: "info",
                });
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Setup failed";
            toastManager.add({
                title: "Notifications unavailable",
                description: message,
                type: "error",
            });
        } finally {
            setIsEnablingNotifications(false);
        }
    }

    async function handleCopyProfileLink() {
        const url = new URL(`/user/${user.userId}`, window.location.origin);

        try {
            await navigator.clipboard.writeText(url.toString());
            toastManager.add({
                title: "Profile link copied",
                type: "success",
            });
        } catch (error) {
            console.error("Failed to copy profile link", error);
            toastManager.add({
                title: "Copy failed",
                description: "Akari could not copy your profile link.",
                type: "error",
            });
        }
    }

    async function handleRefreshAccountData() {
        setIsRefreshing(true);

        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["account"] }),
                queryClient.invalidateQueries({ queryKey: ["user"] }),
                queryClient.invalidateQueries({ queryKey: ["bookmarks"] }),
            ]);
            toastManager.add({
                title: "Account data refreshed",
                type: "success",
            });
        } finally {
            setIsRefreshing(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>
                    Export data, enable updates, and refresh account state
                </CardDescription>
            </CardHeader>
            <CardPanel>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <Button
                        variant="outline"
                        onClick={handleExportBookmarks}
                        loading={isExportingBookmarks}
                    >
                        <Download className="size-4" />
                        Export Bookmarks
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleEnableNotifications}
                        loading={isEnablingNotifications}
                    >
                        <Bell className="size-4" />
                        Enable Notifications
                    </Button>
                    <Button variant="outline" onClick={handleCopyProfileLink}>
                        <Clipboard className="size-4" />
                        Copy Profile Link
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRefreshAccountData}
                        loading={isRefreshing}
                    >
                        <RefreshCcw className="size-4" />
                        Refresh Data
                    </Button>
                </div>
            </CardPanel>
        </Card>
    );
}

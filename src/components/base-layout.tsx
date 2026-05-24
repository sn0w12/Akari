import { Sidebar } from "@/components/ui/sidebar";
import { useBorderColor } from "@/contexts/border-color-context";
import { ErrorProvider } from "@/contexts/error-context";
import { useUser } from "@/hooks/use-user";
import { fetchNotification } from "@/lib/manga/bookmarks";
import { useSetting, useShortcutSetting } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { BaseSidebarContent } from "./base/sidebar-content";
import { HeaderComponent } from "./header";
import { PullToRefresh } from "./pull-to-refresh";

export function BaseLayout({
    children,
    gutter,
}: {
    children: React.ReactNode;
    gutter?: boolean;
}) {
    const router = useRouter();
    const { data: user } = useUser();
    const { borderClass } = useBorderColor();
    const viewTransitions = useSetting("viewTransitions");

    const { data: notification = "" } = useQuery({
        queryKey: ["notification"],
        queryFn: fetchNotification,
        enabled: !!user,
    });

    const handleRefresh = async (): Promise<void> => {
        router.invalidate();
    };

    const handleSettingsClick = () => {
        router.navigate({ to: "/settings" });
    };

    useShortcutSetting("openSettings", handleSettingsClick, {
        preventDefault: true,
    });
    useShortcutSetting(
        "navigateBookmarks",
        () => {
            router.navigate({ to: "/bookmarks" });
        },
        { preventDefault: true },
    );

    return (
        <div className="flex flex-col w-full">
            <HeaderComponent notification={notification} />
            <div className="bg-background md:bg-sidebar flex flex-1 h-full">
                <Sidebar collapsible="icon" aria-label="Main navigation">
                    <BaseSidebarContent notification={notification} />
                </Sidebar>
                <PullToRefresh
                    as="main"
                    onRefresh={handleRefresh}
                    className={cn(
                        "bg-background min-h-[var(--visible-height)] md:min-h-none h-full w-full flex flex-col md:border-t md:rounded-tl-xl md:border-l md:overflow-y-auto",
                        borderClass,
                    )}
                    style={{
                        scrollbarGutter: gutter ? "stable" : "auto",
                        viewTransitionName: viewTransitions
                            ? "main-content"
                            : undefined,
                    }}
                    id="scroll-element"
                >
                    <ErrorProvider>{children}</ErrorProvider>
                </PullToRefresh>
            </div>
        </div>
    );
}

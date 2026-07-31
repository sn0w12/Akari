import { Button } from "@/components/ui/button";
import { toastManager } from "@/components/ui/toast";
import { exportBookmarks } from "@/lib/manga/export-bookmarks";
import { Download, RefreshCw } from "lucide-react";
import { useTransition } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../ui/tooltip";
import { TabBarAdditionList, TabBarAdditionTrigger } from "../ui/tab-bar";
import { BookmarkSearch } from "./header/search";

type BookmarksHeaderProps = {
    onRefresh: () => void;
    isRefreshing?: boolean;
};

export default function BookmarksHeader({
    onRefresh,
    isRefreshing = false,
}: BookmarksHeaderProps) {
    const [isPending, startTransition] = useTransition();

    function handleExportBookmarks() {
        startTransition(() => {
            void exportBookmarks().catch(() => {
                toastManager.add({
                    title: "Error fetching bookmarks",
                    type: "error",
                });
            });
        });
    }

    return (
        <>
            <div className="relative mb-4">
                <div className="flex flex-row gap-0 md:gap-4">
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hidden md:flex w-auto items-center justify-center px-4"
                                            loading={isRefreshing}
                                            loadingIcon={<RefreshCw />}
                                            onClick={onRefresh}
                                        >
                                            <RefreshCw />
                                        </Button>
                                    }
                                />
                                <TooltipContent side="bottom">
                                    Refresh Bookmarks
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="hidden md:flex w-auto items-center justify-center px-4"
                                            loading={isPending}
                                            onClick={handleExportBookmarks}
                                        >
                                            <Download />
                                        </Button>
                                    }
                                />
                                <TooltipContent side="bottom">
                                    Export Bookmarks
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <BookmarkSearch />
                </div>
            </div>
            <TabBarAdditionList>
                <TabBarAdditionTrigger
                    onClick={handleExportBookmarks}
                    loading={isPending}
                >
                    <Download />
                </TabBarAdditionTrigger>
                <TabBarAdditionTrigger
                    onClick={onRefresh}
                    loading={isRefreshing}
                    loadingIcon={<RefreshCw />}
                    className="border-l-1 border-border"
                >
                    <RefreshCw />
                </TabBarAdditionTrigger>
            </TabBarAdditionList>
        </>
    );
}

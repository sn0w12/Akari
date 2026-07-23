import { HistoryContent } from "@/components/account/history-content";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/account/history/")({
    component: HistoryPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .noCache()
            .private()
            .build(),
    }),
});

function HistoryPage() {
    return (
        <div className="flex flex-col max-w-6xl mx-auto px-4 pb-4 pt-2 w-full">
            <HistoryContent />
        </div>
    );
}

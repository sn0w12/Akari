import { formatRelativeDate } from "@/lib/utils";

export default function LatestChapterInfo({
    bookmark,
}: {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
}) {
    if (bookmark.chapters.length === 0 || !bookmark.chapters[0]) {
        return (
            <div className="text-sm text-muted-foreground">
                No chapters available
            </div>
        );
    }

    return (
        <div className="text-sm text-muted-foreground flex flex-row">
            <p className="pr-0.5 border-r">
                Pages: {bookmark.chapters[0].pages}
            </p>
            <p className="pl-0.5">
                Updated: {formatRelativeDate(bookmark.chapters[0].updatedAt)}
            </p>
        </div>
    );
}

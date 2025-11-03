import Link from "next/link";
import { cn, formatRelativeDate } from "@/lib/utils";

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
        <div className="text-sm text-muted-foreground">
            <p>
                Latest Chapter:{" "}
                <Link
                    href={`/manga/${bookmark.mangaId}/${bookmark.chapters[0].number}`}
                    rel="noopener noreferrer"
                    className={cn(
                        "box-decoration-clone text-white p-0.5 md:px-1 rounded-sm bg-indigo-600 hover:bg-indigo-700 transition-colors",
                        {
                            "bg-cyan-600 hover:bg-cyan-700":
                                bookmark.lastReadChapter.number ===
                                bookmark.chapters[1]?.number,
                            "bg-green-600 hover:bg-green-700":
                                bookmark.lastReadChapter.number ===
                                bookmark.chapters[0]?.number,
                        }
                    )}
                    style={{ WebkitBoxDecorationBreak: "clone" }}
                    prefetch={false}
                    data-no-prefetch
                    aria-label={`Latest chapter ${bookmark.chapters[0].number}`}
                >
                    {bookmark.chapters[0]?.title}
                </Link>
            </p>
            <p className="text-xs text-muted-foreground">
                Updated: {formatRelativeDate(bookmark.chapters[0].updatedAt)}
            </p>
        </div>
    );
}

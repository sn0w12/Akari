import { Bookmark } from "@/types/manga";
import Link from "next/link";

export default function LatestChapterInfo({
    bookmark,
    colors,
}: {
    bookmark: Bookmark;
    colors: string;
}) {
    return (
        <div className="text-sm text-muted-foreground">
            <p>
                Latest Chapter:{" "}
                <Link
                    href={`/manga/${bookmark.mangaUrl
                        .split("/")
                        .pop()}/${bookmark.latestChapter.url.split("/").pop()}`}
                    rel="noopener noreferrer"
                    className={`box-decoration-clone text-white p-0.5 md:pr-1 rounded-sm ${colors} transition-colors`}
                    style={{ WebkitBoxDecorationBreak: "clone" }}
                    prefetch={false}
                    data-no-prefetch
                    aria-label={`Latest chapter ${bookmark.latestChapter.number}`}
                >
                    {bookmark.latestChapter.name}
                </Link>
            </p>
            <p className="text-xs text-muted-foreground">
                Updated: {bookmark.latestChapter.lastUpdated}
            </p>
        </div>
    );
}

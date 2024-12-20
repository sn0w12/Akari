import { Bookmark } from "@/app/api/interfaces";
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
                    href={`/manga/${bookmark.link_story
                        .split("/")
                        .pop()}/${bookmark.link_chapter_last.split("/").pop()}`}
                    rel="noopener noreferrer"
                    className={`box-decoration-clone text-white p-0.5 md:pr-1 rounded-sm ${colors} transition-colors`}
                    style={{ WebkitBoxDecorationBreak: "clone" }}
                >
                    {bookmark.chapterlastname}
                </Link>
            </p>
            <p className="text-xs text-gray-400">
                Updated: {bookmark.chapterlastdateupdate}
            </p>
        </div>
    );
}

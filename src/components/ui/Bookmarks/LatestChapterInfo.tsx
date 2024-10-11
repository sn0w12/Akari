import { Bookmark } from "@/app/api/interfaces";

export default function LatestChapterInfo({
    bookmark,
}: {
    bookmark: Bookmark;
}) {
    return (
        <div className="text-sm text-muted-foreground">
            <p>
                Latest Chapter:{" "}
                <a
                    href={`/manga/${bookmark.link_story
                        .split("/")
                        .pop()}/${bookmark.link_chapter_last.split("/").pop()}`}
                    rel="noopener noreferrer"
                    className="box-decoration-clone text-foreground p-0.5 md:pr-1 rounded-sm bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    style={{ WebkitBoxDecorationBreak: "clone" }}
                >
                    {bookmark.chapterlastname}
                </a>
            </p>
            <p className="text-xs text-gray-400">
                Updated: {bookmark.chapterlastdateupdate}
            </p>
        </div>
    );
}

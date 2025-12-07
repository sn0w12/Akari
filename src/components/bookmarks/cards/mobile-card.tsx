import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import LatestChapterInfo from "./latest-chapter-info";
import { cn } from "@/lib/utils";
import { ConfirmDialogs } from "./confirm-dialogs";

const MobileBookmarkCard: React.FC<{
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
    setUpdatedBookmarks: React.Dispatch<
        React.SetStateAction<
            components["schemas"]["BookmarkListResponse"]["items"]
        >
    >;
}> = ({ bookmark, setUpdatedBookmarks }) => {
    const newChapter =
        bookmark.lastReadChapter.number === bookmark.chapters[1]?.number;
    const upToDate =
        bookmark.lastReadChapter.number === bookmark.chapters[0]?.number;

    return (
        <Card className="flex flex-row items-start  bg-card border border-border rounded-lg p-0 md:hidden">
            <CardContent className="p-4 flex flex-col flex-shrink justify-between w-full">
                <div className="mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-full shrink-0">
                            <Link
                                href={`/manga/${bookmark.mangaId}`}
                                rel="noopener noreferrer"
                                className="block"
                                prefetch={false}
                                tabIndex={-1}
                                aria-hidden="true"
                            >
                                <Image
                                    src={bookmark.cover}
                                    alt={bookmark.title}
                                    width={300}
                                    height={450}
                                    className="w-full h-auto object-cover rounded"
                                />
                            </Link>
                        </div>
                        <Link
                            className="w-full"
                            href={`/manga/${bookmark.mangaId}`}
                            prefetch={false}
                        >
                            <h3 className="font-bold text-2xl mb-2 text-center hover:underline">
                                {bookmark.title}
                            </h3>
                        </Link>
                        <ConfirmDialogs
                            bookmark={bookmark}
                            setUpdatedBookmarks={setUpdatedBookmarks}
                            className="gap-1"
                        />
                    </div>
                    {/* Continue Reading Button */}
                    <ButtonLink
                        href={`/manga/${bookmark.mangaId}/${
                            newChapter
                                ? bookmark.chapters[0]?.number
                                : bookmark.lastReadChapter.number
                        }`}
                        rel="noopener noreferrer"
                        className={cn(
                            "mt-2 py-4 px-6 w-full text-lg font-bold text-white bg-accent-positive hover:bg-accent-positive/90 transition-colors",
                            {
                                "bg-cyan-600 hover:bg-cyan-700": newChapter,
                                "bg-green-600 hover:bg-green-700": upToDate,
                            }
                        )}
                        prefetch={false}
                    >
                        {newChapter
                            ? bookmark.chapters[0]?.title
                            : bookmark.lastReadChapter.title}
                    </ButtonLink>
                </div>
                <LatestChapterInfo bookmark={bookmark} />
            </CardContent>
        </Card>
    );
};

export default MobileBookmarkCard;

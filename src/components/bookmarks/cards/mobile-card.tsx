import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Bookmark } from "@/types/manga";
import LatestChapterInfo from "./latest-chapter-info";
import { getButtonInfo } from "@/lib/manga/bookmarks";
import { imageUrl } from "@/lib/utils";
import { ConfirmDialogs } from "./confirm-dialogs";

const MobileBookmarkCard: React.FC<{
    bookmark: Bookmark;
    setUpdatedBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>>;
}> = ({ bookmark, setUpdatedBookmarks }) => {
    const {
        mangaIdentifier,
        continueReading,
        continueReadingText,
        buttonColor,
    } = getButtonInfo(bookmark);

    return (
        <Card className="flex flex-row items-start  bg-card border border-border rounded-lg p-0 md:hidden">
            <CardContent className="p-4 flex flex-col flex-shrink justify-between w-full">
                <div className="mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-full shrink-0">
                            <Link
                                href={`/manga/${mangaIdentifier}`}
                                rel="noopener noreferrer"
                                className="block"
                                prefetch={false}
                                tabIndex={-1}
                                aria-hidden="true"
                            >
                                <Image
                                    src={imageUrl(bookmark.coverImage)}
                                    alt={bookmark.title}
                                    width={300}
                                    height={450}
                                    className="w-full h-auto object-cover rounded"
                                />
                            </Link>
                        </div>
                        <Link
                            className="w-full"
                            href={`/manga/${mangaIdentifier}`}
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
                        href={`/manga/${mangaIdentifier}/${continueReading
                            .split("/")
                            .pop()}`}
                        rel="noopener noreferrer"
                        className={`mt-2 py-4 px-6 w-full text-lg font-bold text-white ${buttonColor} transition-colors`}
                    >
                        {continueReadingText}
                    </ButtonLink>
                </div>
                {LatestChapterInfo({ bookmark, colors: buttonColor })}
            </CardContent>
        </Card>
    );
};

export default MobileBookmarkCard;

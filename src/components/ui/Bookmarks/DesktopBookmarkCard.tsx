"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/app/api/interfaces";
import LatestChapterInfo from "./LatestChapterInfo";
import { getButtonInfo } from "@/lib/bookmarks";

const DesktopBookmarkCard: React.FC<{
    bookmark: Bookmark;
}> = ({ bookmark }) => {
    const router = useRouter();
    const {
        mangaIdentifier,
        continueReading,
        continueReadingText,
        buttonColor,
    } = getButtonInfo(bookmark);

    const prefetchMangaData = () => {
        router.prefetch(`/manga/${mangaIdentifier}`);
    };
    const prefetchChapterData = (link: string) => {
        router.prefetch(`/manga/${mangaIdentifier}/${link.split("/").pop()}`);
    };

    return (
        <Card className="hidden md:flex flex-row items-start p-6 shadow-lg bg-card border border-border rounded-lg xl:h-full">
            <div className="w-40 h-full mb-0 shrink-0">
                <Link
                    href={`/manga/${mangaIdentifier}`}
                    rel="noopener noreferrer"
                    className="block"
                    onMouseEnter={prefetchMangaData}
                    prefetch={false}
                >
                    <Image
                        src={bookmark.image}
                        alt={bookmark.storyname}
                        width={300}
                        height={450}
                        className="w-full h-auto object-cover rounded"
                    />
                </Link>
            </div>
            <CardContent className="ml-4 mr-4 flex flex-col flex-shrink justify-between">
                <div className="mb-4">
                    <Link
                        href={`/manga/${mangaIdentifier}`}
                        onMouseEnter={prefetchMangaData}
                        prefetch={false}
                    >
                        <h3 className="font-bold text-2xl mb-2 mr-10 hover:underline text-left">
                            {bookmark.storyname}
                        </h3>
                    </Link>
                    {/* Continue Reading Button */}
                    <Link
                        href={`/manga/${mangaIdentifier}/${continueReading.split("/").pop()}`}
                        rel="noopener noreferrer"
                        className="block mt-4"
                        onMouseEnter={() =>
                            prefetchChapterData(continueReading)
                        }
                        prefetch={false}
                    >
                        <Button
                            className={`py-4 px-6 text-lg font-bold text-white ${buttonColor} transition-colors`}
                        >
                            {continueReadingText}
                        </Button>
                    </Link>
                </div>
                {LatestChapterInfo({
                    bookmark,
                    colors: buttonColor,
                    prefetchChapterData,
                })}
            </CardContent>
        </Card>
    );
};

export default DesktopBookmarkCard;

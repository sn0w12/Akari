import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Bookmark } from "@/app/api/interfaces";
import LatestChapterInfo from "./LatestChapterInfo";
import { compareVersions } from "@/lib/bookmarks";

const MobileBookmarkCard: React.FC<{ bookmark: Bookmark }> = ({ bookmark }) => {
    const mangaIdentifier = bookmark.link_story.split("/").pop();
    let continueReading = bookmark.link_chapter_now;
    let continueReadingText = `Chapter ${bookmark.chapter_numbernow}`;
    let buttonColor = "bg-blue-600 hover:bg-blue-700";

    if (bookmark.up_to_date && bookmark.up_to_date === true) {
        continueReading = bookmark.link_chapter_last;

        if (bookmark.chapterlastnumber === bookmark.chapter_numbernow) {
            continueReadingText = `Chapter ${bookmark.chapterlastnumber}`;
            buttonColor = "bg-green-600 hover:bg-green-700";
        } else if (
            compareVersions(
                bookmark.chapterlastnumber,
                bookmark.chapter_numbernow,
            )
        ) {
            continueReadingText = `Chapter ${bookmark.chapterlastnumber}`;
            buttonColor = "bg-indigo-600 hover:bg-indigo-700";
        }
    }

    return (
        <Card className="flex flex-row items-start shadow-lg bg-card border border-border rounded-lg">
            <CardContent className="pt-6 flex flex-col flex-shrink justify-between w-full">
                <div className="mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-20 h-full mb-0 shrink-0">
                            <a
                                href={`/manga/${mangaIdentifier}`}
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Image
                                    src={bookmark.image}
                                    alt={bookmark.storyname}
                                    width={300}
                                    height={450}
                                    className="w-full h-auto object-cover rounded"
                                />
                            </a>
                        </div>
                        <Link
                            className="w-full"
                            href={`/manga/${mangaIdentifier}`}
                        >
                            <h3 className="font-bold text-2xl mb-2 text-center hover:underline">
                                {bookmark.storyname}
                            </h3>
                        </Link>
                    </div>
                    {/* Continue Reading Button */}
                    <a
                        href={`/manga/${mangaIdentifier}/${continueReading.split("/").pop()}`}
                        rel="noopener noreferrer"
                        className="block mt-4"
                    >
                        <Button
                            className={`py-4 px-6 w-full text-lg font-bold text-white ${buttonColor} transition-colors`}
                        >
                            {continueReadingText}
                        </Button>
                    </a>
                </div>
                {LatestChapterInfo({ bookmark })}
            </CardContent>
        </Card>
    );
};

export default MobileBookmarkCard;

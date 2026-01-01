"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { cn, generateSizes } from "@/lib/utils";
import { ChaptersPopup } from "./chapters-popup";
import { ConfirmDialogs } from "./confirm-dialogs";
import LatestChapterInfo from "./latest-chapter-info";

interface DesktopBookmarkCardProps {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
    setUpdatedBookmarks: React.Dispatch<
        React.SetStateAction<
            components["schemas"]["BookmarkListResponse"]["items"]
        >
    >;
}

function DesktopBookmarkCard({
    bookmark,
    setUpdatedBookmarks,
}: DesktopBookmarkCardProps) {
    const newChapter =
        bookmark.lastReadChapter.number === bookmark.chapters[1]?.number;
    const upToDate =
        bookmark.lastReadChapter.number === bookmark.chapters[0]?.number;

    return (
        <Card className="hidden md:flex flex-row items-start p-6 pr-2 bg-card border border-border rounded-lg xl:h-full">
            <div className="w-30 lg:w-40 h-full mb-0 shrink-0">
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
                        sizes={generateSizes({
                            md: "128px",
                            lg: "160px",
                        })}
                    />
                </Link>
            </div>
            <CardContent className="px-4 flex flex-col flex-shrink justify-between relative w-full">
                <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-top gap-2 w-full justify-between">
                        <Link
                            href={`/manga/${bookmark.mangaId}`}
                            prefetch={false}
                        >
                            <h3 className="font-bold text-2xl hover:underline text-left text-ellipsis">
                                {bookmark.title}
                            </h3>
                        </Link>
                        <ConfirmDialogs
                            bookmark={bookmark}
                            setUpdatedBookmarks={setUpdatedBookmarks}
                        />
                    </div>
                    <div className="flex flex-row gap-2 mb-2">
                        {/* Continue Reading Button */}
                        <ButtonLink
                            href={`/manga/${bookmark.mangaId}/${
                                newChapter
                                    ? bookmark.chapters[0]?.number
                                    : bookmark.lastReadChapter.number
                            }`}
                            rel="noopener noreferrer"
                            className={cn(
                                "w-fit py-4 px-6 text-lg font-bold text-white bg-accent-positive hover:bg-accent-positive/90 transition-colors",
                                {
                                    "bg-cyan-600 hover:bg-cyan-700": newChapter,
                                    "bg-green-600 hover:bg-green-700": upToDate,
                                }
                            )}
                            prefetch={false}
                        >
                            <span>
                                {newChapter
                                    ? bookmark.chapters[0]?.title
                                    : bookmark.lastReadChapter.title}
                            </span>
                        </ButtonLink>
                        <ChaptersPopup
                            mangaId={bookmark.mangaId}
                            lastReadChapter={bookmark.lastReadChapter}
                        />
                    </div>
                    <LatestChapterInfo bookmark={bookmark} />
                </div>
            </CardContent>
        </Card>
    );
}

export default DesktopBookmarkCard;

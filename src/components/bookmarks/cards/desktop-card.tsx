"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import LatestChapterInfo from "./latest-chapter-info";
import { cn, imageUrl } from "@/lib/utils";
import { ChevronsUpDownIcon, Loader2Icon } from "lucide-react";
import { useRef, useState } from "react";
import { ChaptersPopup } from "./chapters-popup";
import { ConfirmDialogs } from "./confirm-dialogs";
import { client } from "@/lib/api";

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
    const [chapters, setChapters] = useState<
        components["schemas"]["MangaChapter"][]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(
        null!
    ) as React.RefObject<HTMLButtonElement>;

    async function showChapters() {
        const newShowState = !showPopup;
        setShowPopup(!showPopup);
        if (newShowState && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Check if popup would extend beyond the right edge
            const popupWidth = 140;
            const idealLeft = rect.right;
            const adjustedLeft = Math.min(
                idealLeft,
                viewportWidth - popupWidth - 20
            ); // 20px safety margin

            setPopupPosition({ top: rect.bottom, left: adjustedLeft });
        }

        if (chapters.length === 0 && !showPopup) {
            setIsLoading(true);
            try {
                const { data, error } = await client.GET("/v2/manga/{id}", {
                    params: {
                        path: {
                            id: bookmark.mangaId,
                        },
                    },
                });

                if (error) {
                    throw new Error("Failed to load chapters");
                }

                setChapters(data.data.chapters);
            } catch (error) {
                console.error("Error loading chapters:", error);
            } finally {
                setIsLoading(false);
            }
        }
    }

    return (
        <Card className="hidden md:flex flex-row items-start p-6 pr-2  bg-card border border-border rounded-lg xl:h-full">
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
                            href={`/manga/${bookmark.mangaId}/${bookmark.lastReadChapter.number}`}
                            rel="noopener noreferrer"
                            className={cn(
                                "w-fit py-4 px-6 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors",
                                {
                                    "bg-cyan-600 hover:bg-cyan-700":
                                        bookmark.lastReadChapter.number ===
                                        bookmark.chapters[1]?.number,
                                    "bg-green-600 hover:bg-green-700":
                                        bookmark.lastReadChapter.number ===
                                        bookmark.chapters[0]?.number,
                                }
                            )}
                            prefetch={false}
                        >
                            <span className="hidden lg:inline">Chapter</span>
                            <span>{bookmark.lastReadChapter.number}</span>
                        </ButtonLink>
                        <Button
                            ref={buttonRef}
                            className="w-10 p-0"
                            onClick={showChapters}
                            disabled={isLoading}
                            aria-label="Browse   chapters"
                        >
                            {isLoading && !showPopup ? (
                                <Loader2Icon className="h-4 w-4 animate-spin" />
                            ) : (
                                <ChevronsUpDownIcon className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <LatestChapterInfo bookmark={bookmark} />

                    {showPopup && (
                        <ChaptersPopup
                            chapters={chapters}
                            onClose={() => setShowPopup(false)}
                            mangaIdentifier={bookmark.mangaId}
                            isLoading={isLoading}
                            lastReadChapter={bookmark.lastReadChapter.number.toString()}
                            position={popupPosition}
                            buttonRef={buttonRef}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default DesktopBookmarkCard;

"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card } from "@/components/ui/card";
import { useLongPress } from "@/hooks/use-long-press";
import { cn, formatRelativeDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChaptersPopup } from "./chapters-popup";
import { ConfirmDialogs } from "./confirm-dialogs";

interface BookmarkCardProps {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
    return (
        <Card className="overflow-hidden p-0 rounded-lg">
            <div className="flex flex-col gap-2 p-4">
                <div className="flex gap-2">
                    {/* Cover Image */}
                    <div className="w-20 lg:w-30 h-full mb-0 shrink-0">
                        <Link
                            href={`/manga/${bookmark.mangaId}`}
                            rel="noopener noreferrer"
                            className="block"
                            prefetch={false}
                            tabIndex={-1}
                            aria-hidden="true"
                            transitionTypes={["transition-forwards"]}
                        >
                            <Image
                                src={bookmark.cover}
                                alt={bookmark.title}
                                height={180}
                                width={120}
                                className="w-full h-auto object-cover rounded-sm"
                                quality={40}
                                sizes="120px"
                            />
                        </Link>
                    </div>

                    {/* Content */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                        {/* Title */}
                        <div>
                            <div className="flex items-center gap-2 justify-between">
                                <Link
                                    className="hover:underline"
                                    href={`/manga/${bookmark.mangaId}`}
                                    prefetch={false}
                                    transitionTypes={["transition-forwards"]}
                                >
                                    <h3 className="line-clamp-2 flex-1 text-lg font-semibold leading-snug">
                                        {bookmark.title}
                                    </h3>
                                </Link>
                                <ConfirmDialogs bookmark={bookmark} />
                            </div>

                            <SubTitle
                                label="Latest"
                                value={`Ch. ${bookmark.latestChapter.number}`}
                            />
                            <SubTitle
                                label="Released"
                                value={formatRelativeDate(
                                    bookmark.latestChapter.createdAt,
                                )}
                            />
                        </div>
                        <ActionButton
                            bookmark={bookmark}
                            className="hidden md:flex"
                        />
                    </div>
                </div>
                <ActionButton bookmark={bookmark} className="md:hidden" />
            </div>
        </Card>
    );
}

interface ActionButtonProps {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
    className?: string;
}

function ActionButton({ bookmark, className }: ActionButtonProps) {
    const [open, setOpen] = useState(false);
    const { release, handlers, style } = useLongPress(
        () => setOpen(true),
        500,
        {
            controlledAfterPress: true,
        },
    );

    useEffect(() => {
        if (!open) release();
    }, [open, release]);

    // Check if user is caught up (read the latest chapter)
    const isCaughtUp = bookmark.chaptersBehind === 0;
    // Check if user should just read the latest (read second-to-latest)
    const shouldReadLatest = bookmark.chaptersBehind === 1;

    return (
        <div className={cn("flex items-center gap-2 w-full", className)}>
            <div className="w-full" {...handlers} style={style}>
                {isCaughtUp ? (
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 w-full bg-transparent"
                        disabled
                    >
                        All caught up!
                    </Button>
                ) : shouldReadLatest ? (
                    <ButtonLink
                        href={`/manga/${bookmark.mangaId}/${bookmark.latestChapter.scanlatorId}/${bookmark.latestChapter.number}`}
                        size="sm"
                        className="flex-1 w-full"
                        transitionTypes={["transition-forwards"]}
                    >
                        <p className="hidden md:inline">Read Latest • </p>Ch.{" "}
                        {bookmark.latestChapter.number}
                    </ButtonLink>
                ) : (
                    <ButtonLink
                        href={`/manga/${bookmark.mangaId}/${bookmark.nextChapter.scanlatorId}/${bookmark.nextChapter.number}`}
                        variant="secondary"
                        size="sm"
                        className="flex-1 w-full group"
                        prefetch={false}
                        transitionTypes={["transition-forwards"]}
                    >
                        <p className="hidden md:inline">Continue Reading • </p>
                        Ch. {bookmark.nextChapter.number}
                        <Badge
                            variant="default"
                            className="ml-1.5 text-xs group-hover:bg-primary/80"
                        >
                            {bookmark.chaptersBehind} new
                        </Badge>
                    </ButtonLink>
                )}
            </div>
            <ChaptersPopup
                open={open}
                setOpen={setOpen}
                mangaId={bookmark.mangaId}
                title={bookmark.title}
                lastReadChapter={bookmark.lastReadChapter}
                estimatedChapters={Math.floor(bookmark.latestChapter.number)}
                scanlatorId={bookmark.lastReadChapter.scanlatorId}
            />
        </div>
    );
}

function SubTitle({ label, value }: { label: string; value: string }) {
    return (
        <span className="flex items-center gap-1.5 text-muted-foreground text-sm leading-4">
            {label}: <span className="font-medium">{value}</span>
        </span>
    );
}

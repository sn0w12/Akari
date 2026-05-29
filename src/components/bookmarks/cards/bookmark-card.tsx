import { Image } from "@/components/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardPanel } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/group";
import { useLongPress } from "@/hooks/use-long-press";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChaptersPopup } from "./chapters-popup";
import { ConfirmDialogs } from "./confirm-dialogs";

interface BookmarkCardProps {
    bookmark: components["schemas"]["BookmarkListResponse"]["items"][number];
}

export function BookmarkCard({ bookmark }: BookmarkCardProps) {
    return (
        <Card>
            <CardPanel className="flex flex-col gap-2">
                <div className="flex gap-2">
                    {/* Cover Image */}
                    <div className="w-20 lg:w-30 h-full mb-0 shrink-0">
                        <Link
                            to="/manga/$mangaId"
                            params={{ mangaId: bookmark.mangaId }}
                            rel="noopener noreferrer"
                            className="block"
                            tabIndex={-1}
                            aria-hidden="true"
                        >
                            <Image
                                src={bookmark.cover}
                                alt={bookmark.title}
                                height={180}
                                width={120}
                                className="w-full h-auto object-cover rounded-lg"
                                sizes={{ default: "120px" }}
                                quality={40}
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
                                    to="/manga/$mangaId"
                                    params={{ mangaId: bookmark.mangaId }}
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
            </CardPanel>
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
        <ButtonGroup className={cn("w-full", className)}>
            {isCaughtUp ? (
                <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 w-full"
                    disabled
                    {...handlers}
                    style={style}
                >
                    All caught up!
                </Button>
            ) : shouldReadLatest ? (
                <ButtonLink
                    to="/manga/$mangaId/$scanlator/$subId"
                    params={
                        {
                            mangaId: bookmark.mangaId,
                            scanlator: String(
                                bookmark.latestChapter.scanlatorId,
                            ),
                            subId: String(bookmark.latestChapter.number),
                        } as never
                    }
                    size="sm"
                    className="flex-1 w-full"
                    {...handlers}
                >
                    <p className="hidden md:inline">Read Latest • </p>Ch.{" "}
                    {bookmark.latestChapter.number}
                </ButtonLink>
            ) : (
                <ButtonLink
                    to="/manga/$mangaId/$scanlator/$subId"
                    params={
                        {
                            mangaId: bookmark.mangaId,
                            scanlator: String(bookmark.nextChapter.scanlatorId),
                            subId: String(bookmark.nextChapter.number),
                        } as never
                    }
                    variant="outline"
                    size="sm"
                    className="flex-1 w-full group"
                    {...handlers}
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
            <ChaptersPopup
                open={open}
                setOpen={setOpen}
                mangaId={bookmark.mangaId}
                title={bookmark.title}
                lastReadChapter={bookmark.lastReadChapter}
                estimatedChapters={Math.floor(bookmark.latestChapter.number)}
                scanlatorId={bookmark.lastReadChapter.scanlatorId}
            />
        </ButtonGroup>
    );
}

function SubTitle({ label, value }: { label: string; value: string }) {
    return (
        <span className="flex items-center gap-1.5 text-muted-foreground text-sm leading-4">
            {label}: <span className="font-medium">{value}</span>
        </span>
    );
}

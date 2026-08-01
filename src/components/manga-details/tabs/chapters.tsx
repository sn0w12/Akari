import { Link } from "@tanstack/react-router";
import { ArrowUpDown, BookOpen, Clock } from "lucide-react";
import { type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectItem,
    SelectPopup,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, formatRelativeDate } from "@/lib/utils";

type MangaChapter = components["schemas"]["MangaChapter"];
type ChapterEntry = MangaChapter & { isGapFill?: boolean };

function chapterParams(mangaId: string, scanlatorId: number, number: number) {
    return {
        mangaId,
        scanlator: String(scanlatorId),
        subId: String(number),
    };
}

interface ChaptersControlsProps {
    sortOrder: "asc" | "desc";
    onSortChange: (order: "asc" | "desc") => void;
    scanlatorId: number;
    onScanlatorChange: (id: number) => void;
    scanlatorOptions: { value: number; label: string }[];
    children?: ReactNode;
}

export function ChaptersControls({
    sortOrder,
    onSortChange,
    scanlatorId,
    onScanlatorChange,
    scanlatorOptions,
    children,
}: ChaptersControlsProps) {
    return (
        <div className="pointer-events-auto flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
            {scanlatorOptions.length > 1 && (
                <Select
                    items={scanlatorOptions}
                    value={scanlatorId}
                    onValueChange={(value) => onScanlatorChange(Number(value))}
                >
                    <SelectTrigger className="w-full lg:w-40 h-9">
                        <SelectValue placeholder="Select Scanlator" />
                    </SelectTrigger>
                    <SelectPopup align="center">
                        {scanlatorOptions.map(({ label, value }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectPopup>
                </Select>
            )}
            {children}
            <Button
                onClick={() =>
                    onSortChange(sortOrder === "asc" ? "desc" : "asc")
                }
                className="lg:flex-1 lg:w-40 sm:h-9 has-[>svg]:px-4"
            >
                <ArrowUpDown className="size-4" />
                Sort {sortOrder === "asc" ? "Descending" : "Ascending"}
            </Button>
        </div>
    );
}

interface ChapterCardProps {
    mangaId: string;
    chapter: ChapterEntry;
    lastReadId: string | undefined;
    isCurrentScanlator: boolean;
    scanlatorName: string | undefined;
}

export function ChapterCard({
    mangaId,
    chapter,
    lastReadId,
    isCurrentScanlator,
    scanlatorName,
}: ChapterCardProps) {
    const isLastRead = chapter.id === lastReadId;

    return (
        <Card
            className={cn(
                "h-full p-0 transition-colors",
                isLastRead && "bg-accent-positive hover:bg-accent-positive/70",
                !isLastRead && "hover:bg-card/70",
                chapter.isGapFill && "border-dashed",
            )}
            render={
                <Link
                    to="/manga/$mangaId/$scanlator/$subId"
                    params={chapterParams(
                        mangaId,
                        chapter.scanlatorId,
                        chapter.number,
                    )}
                    id={chapter.id}
                />
            }
        >
            <CardContent className="p-4">
                <h3
                    className={cn(
                        "mb-2 line-clamp-2 font-semibold",
                        isLastRead && "text-background",
                    )}
                >
                    {chapter.title}
                </h3>
                <p
                    className={cn(
                        "flex items-center gap-1 text-sm text-muted-foreground",
                        isLastRead && "text-background",
                    )}
                >
                    <BookOpen className="size-3.5" />
                    {chapter.pages}
                </p>
                <div className="flex w-full min-w-0 items-center gap-1">
                    <Released chapter={chapter} isLastRead={isLastRead} />
                    <Badge
                        variant={isCurrentScanlator ? "default" : "outline"}
                        size="sm"
                        className="block max-w-full shrink truncate"
                    >
                        {scanlatorName}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

function Released({
    chapter,
    isLastRead,
}: {
    chapter: ChapterEntry;
    isLastRead: boolean;
}) {
    return (
        <p
            className={cn(
                "flex min-w-fit flex-1 items-center gap-1 overflow-hidden text-nowrap text-sm text-muted-foreground",
                isLastRead && "text-background",
            )}
        >
            <Clock className="size-3.5" />
            {formatRelativeDate(chapter.createdAt)}
        </p>
    );
}

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ScoreDisplay from "./manga-details/score";
import Buttons from "./manga-details/buttons";
import EnhancedImage from "./ui/enhanced-image";
import { ChaptersSection } from "./manga-details/chapters";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { cacheLife } from "next/cache";
import { formatRelativeDate } from "@/lib/utils";
import { MangaComments } from "./manga-details/manga-comments";
import { ViewManga } from "./manga-reader/view-manga";

import MalImage from "@/public/img/icons/MAL-logo.webp";
import AniImage from "@/public/img/icons/AniList-logo.webp";

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "ongoing":
            return "bg-accent-positive hover:bg-accent-positive";
        case "completed":
            return "bg-info hover:bg-info";
        case "hiatus":
            return "bg-warning hover:bg-warning";
        default:
            return "bg-primary hover:bg-primary";
    }
};

const getViewsColor = (views: number) => {
    if (views < 100)
        return { bg: "bg-[#ffc659] hover:bg-[#ffc659]", text: "text-black" };
    else if (views < 1_000)
        return { bg: "bg-[#ff8f70] hover:bg-[#ff8f70]", text: "text-black" };
    else if (views < 10_000)
        return { bg: "bg-[#ff609e] hover:bg-[#ff609e]", text: "text-white" };
    else if (views < 100_000)
        return { bg: "bg-[#e255d0] hover:bg-[#e255d0]", text: "text-white" };

    return {
        bg: "bg-accent-positive hover:bg-accent-positive",
        text: "text-white",
    };
};

function ExternalLinks({
    manga,
}: {
    manga: components["schemas"]["MangaDetailResponse"];
}) {
    return (
        <>
            {manga.aniId && (
                <Link
                    href={`https://anilist.co/manga/${manga.aniId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                    prefetch={false}
                >
                    <Image
                        src={AniImage}
                        alt="AniList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                        width={40}
                        height={40}
                    />
                </Link>
            )}
            {manga.malId && (
                <Link
                    href={`https://myanimelist.net/manga/${manga.malId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                    prefetch={false}
                >
                    <Image
                        src={MalImage}
                        alt="MyAnimeList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                        width={40}
                        height={40}
                    />
                </Link>
            )}
        </>
    );
}

export async function MangaDetailsComponent({
    manga,
}: {
    manga: components["schemas"]["MangaDetailResponse"];
}) {
    "use cache";
    cacheLife("minutes");

    return (
        <div className="mx-auto p-4">
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-4 items-stretch h-auto">
                {/* Image and Details Section */}
                <div className="flex flex-shrink-0 justify-center hidden lg:block">
                    <EnhancedImage
                        src={manga.cover}
                        alt={manga.title}
                        className="rounded-lg object-cover h-auto max-w-lg min-w-full w-full lg:h-[600px]"
                        hoverEffect="dynamic-tilt"
                        width={400}
                        height={600}
                        preload={true}
                        fetchPriority="high"
                    />
                </div>

                {/* Card with flex layout to lock title and buttons */}
                <Card className="p-6 flex flex-col justify-between flex-grow lg:max-h-[600px] bg-background gap-0">
                    {/* Title stays at the top */}
                    <div className="flex items-center mb-4 border-b pb-4 justify-between">
                        <Image
                            src={manga.cover}
                            alt={manga.title}
                            className="rounded-lg object-cover h-auto w-24 sm:w-30 md:w-40 lg:hidden mr-4"
                            width={400}
                            height={600}
                            preload={true}
                            fetchPriority="high"
                        />
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {manga.title}
                            </h1>
                            {manga.alternativeTitles &&
                                manga.alternativeTitles.length > 0 && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <InfoIcon className="w-5 h-5 hidden lg:block" />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <div className="flex flex-col gap-1 max-w-96 w-auto">
                                                {manga.alternativeTitles.map(
                                                    (
                                                        mangaName: string,
                                                        index: number
                                                    ) => (
                                                        <p
                                                            className="max-w-xs px-1 border-b border-background pb-1 last:border-b-0"
                                                            key={index}
                                                        >
                                                            {mangaName}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                        </div>
                        <div
                            className={
                                "flex-shrink-0 flex-col gap-2 flex lg:gap-0 lg:flex-row"
                            }
                        >
                            <ExternalLinks manga={manga} />
                        </div>
                    </div>

                    {manga.alternativeTitles &&
                        manga.alternativeTitles.length > 0 && (
                            <div className="border-b pb-4 mb-4 flex flex-row lg:hidden justify-between items-center">
                                <span className="px-1 rounded opacity-70">
                                    {manga.alternativeTitles
                                        .map((name: string) => name.trim())
                                        .join(" | ")}
                                </span>
                            </div>
                        )}

                    {/* Middle section grows as needed */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-grow overflow-hidden">
                        {/* Left section for the manga details */}
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-lg font-semibold mb-1">
                                        Authors:
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {manga.authors.map(
                                            (author: string, index: number) => (
                                                <Link
                                                    href={`/author/${encodeURIComponent(
                                                        author.replaceAll(
                                                            " ",
                                                            "-"
                                                        )
                                                    )}`}
                                                    key={index}
                                                    prefetch={false}
                                                    data-no-prefetch
                                                >
                                                    <Badge
                                                        withShadow={true}
                                                        className="bg-primary text-secondary hover:bg-gray-300 hover:text-primary dark:hover:text-secondary"
                                                        shadowClassName="mt-[4px]"
                                                    >
                                                        {author}
                                                    </Badge>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold mb-1">
                                        Status:
                                    </div>
                                    <Badge
                                        className={`${getStatusColor(
                                            manga.status
                                        )} text-white`}
                                    >
                                        {manga.status}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold mb-1">
                                        Updated:
                                    </div>
                                    <Badge className="hover:bg-primary">
                                        {formatRelativeDate(manga.updatedAt)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold mb-1">
                                        Views:
                                    </div>
                                    <Badge
                                        className={`${
                                            getViewsColor(manga.views).bg
                                        } ${getViewsColor(manga.views).text}`}
                                    >
                                        {manga.views}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-col h-full">
                                <div className="h-fit">
                                    <h2 className="text-xl font-semibold mb-2">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2 overflow-y-visible lg:max-h-32 lg:overflow-y-auto xl:overflow-y-visible xl:max-h-96">
                                        {manga.genres.map((genre: string) => (
                                            <Link
                                                key={genre}
                                                href={`/genre/${encodeURIComponent(
                                                    genre.replaceAll(" ", "_")
                                                )}`}
                                                prefetch={false}
                                                data-no-prefetch
                                            >
                                                <Badge
                                                    variant="secondary"
                                                    withShadow={true}
                                                    className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                                                    shadowClassName="mt-[3px]"
                                                >
                                                    {genre}
                                                </Badge>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 flex-grow block lg:hidden xl:block lg:mb-4">
                                    <ScoreDisplay score={manga.score / 2} />
                                </div>
                            </div>

                            {/* Bookmark and Start Reading Buttons */}
                            <Buttons manga={manga} />
                        </div>
                        {/* Right section for the description */}
                        <div className="lg:w-1/2 flex-grow h-full">
                            <Card
                                className="w-full h-full max-h-60 md:max-h-96 lg:max-h-none p-4 overflow-y-auto"
                                aria-label="Description"
                                role="region"
                                data-scrollbar-custom
                            >
                                <p>{manga.description}</p>
                            </Card>
                        </div>
                    </div>
                </Card>
            </div>

            <ViewManga manga={manga} />
            <ChaptersSection manga={manga} />
            <MangaComments manga={manga} />
        </div>
    );
}

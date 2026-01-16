import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateSizes, pluralize } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import { ListSelector } from "./list/list-selector";
import { MangaDetailsBody } from "./manga-details/body";
import Buttons from "./manga-details/buttons";
import { MangaComments } from "./manga-details/manga-comments";
import ScoreDisplay from "./manga-details/score";
import { MangaUpdatedAt } from "./manga-details/updated-at";
import { ViewManga } from "./manga-reader/view-manga";
import EnhancedImage from "./ui/enhanced-image";

import AniImage from "@/public/img/icons/AniList-logo.webp";
import MalImage from "@/public/img/icons/MAL-logo.webp";

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
    rec,
}: {
    manga: components["schemas"]["MangaDetailResponse"];
    rec: components["schemas"]["MangaResponse"][];
}) {
    return (
        <div className="mx-auto p-4">
            <BreadcrumbSetter orig={manga.id} title={manga.title} />
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-2 items-stretch h-auto">
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
                        sizes={generateSizes({
                            sm: "120px",
                            md: "160px",
                            lg: "400px",
                        })}
                    />
                </div>

                {/* Card with flex layout to lock title and buttons */}
                <div className="flex flex-col justify-between flex-grow lg:max-h-[600px] bg-background gap-0">
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
                            sizes={generateSizes({
                                sm: "120px",
                                md: "160px",
                                lg: "400px",
                            })}
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
                                                        index: number,
                                                    ) => (
                                                        <p
                                                            className="max-w-xs px-1 border-b border-background pb-1 last:border-b-0"
                                                            key={index}
                                                        >
                                                            {mangaName}
                                                        </p>
                                                    ),
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
                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 flex-grow overflow-hidden">
                        {/* Left section for the manga details */}
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                <div>
                                    <div className="text-lg font-semibold">
                                        {pluralize(
                                            "Author",
                                            manga.authors.length,
                                        )}
                                        :
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {manga.authors.map(
                                            (author: string, index: number) => (
                                                <Link
                                                    href={`/author/${encodeURIComponent(
                                                        author.replaceAll(
                                                            " ",
                                                            "-",
                                                        ),
                                                    )}`}
                                                    key={index}
                                                    prefetch={false}
                                                >
                                                    <Badge
                                                        withShadow={true}
                                                        className="bg-primary text-secondary hover:bg-gray-300 hover:text-primary dark:hover:text-secondary"
                                                        shadowClassName="mt-[4px]"
                                                    >
                                                        {author}
                                                    </Badge>
                                                </Link>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Status:
                                    </div>
                                    <Badge
                                        className={`${getStatusColor(
                                            manga.status,
                                        )} text-white`}
                                    >
                                        {manga.status.charAt(0).toUpperCase() +
                                            manga.status.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Updated:
                                    </div>
                                    <MangaUpdatedAt
                                        updatedAt={manga.updatedAt}
                                    />
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
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
                                    <h2 className="text-xl font-semibold">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2 overflow-y-visible md:max-h-24 lg:overflow-y-auto xl:overflow-y-visible xl:max-h-96">
                                        {manga.genres.map((genre: string) => (
                                            <Link
                                                key={genre}
                                                href={`/genre/${encodeURIComponent(
                                                    genre.replaceAll(" ", "-"),
                                                )}`}
                                                prefetch={false}
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
                                <div className="my-2 flex-grow block lg:hidden xl:block">
                                    <ScoreDisplay
                                        mangaId={manga.id}
                                        score={manga.score / 2}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-auto">
                                <Buttons manga={manga} />
                                <ListSelector mangaId={manga.id} />
                            </div>
                        </div>
                        {/* Right section for the description */}
                        <div className="lg:w-1/2 flex-grow h-full flex flex-col">
                            <div className="my-2 flex-grow hidden lg:block xl:hidden">
                                <ScoreDisplay
                                    mangaId={manga.id}
                                    score={manga.score / 2}
                                />
                            </div>
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
                </div>
            </div>

            <ViewManga manga={manga} />
            <MangaDetailsBody manga={manga} rec={rec} />
            <MangaComments id={manga.id} />
        </div>
    );
}

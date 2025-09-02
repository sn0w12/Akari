import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import ScoreDisplay from "@/components/ui/MangaDetails/scoreDisplay";
import Buttons from "./ui/MangaDetails/Buttons";
import EnhancedImage from "./ui/enhancedImage";
import { ChaptersSection } from "./ui/MangaDetails/ChaptersSection";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import ErrorComponent from "./ui/error";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { imageUrl } from "@/lib/utils";
import { fetchMangaDetails } from "@/lib/scraping";
import MalImage from "./img/MAL-logo.webp";
import AniImage from "./img/AniList-logo.webp";

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "ongoing":
            return "bg-green-500 hover:bg-green-600";
        case "completed":
            return "bg-blue-500 hover:bg-blue-600";
        case "hiatus":
            return "bg-yellow-500 hover:bg-yellow-600";
        default:
            return "bg-gray-500 hover:bg-gray-600";
    }
};

const getViewsColor = (views: string) => {
    const viewsNum =
        parseFloat(views.replace(/K|M/, "")) *
        (views.includes("M") ? 1_000_000 : 1_000);

    if (viewsNum < 100_000)
        return { bg: "bg-orange-500 hover:bg-orange-600", text: "text-white" };
    else if (viewsNum < 1_000_000)
        return { bg: "bg-yellow-500 hover:bg-yellow-600", text: "text-black" };
    else if (viewsNum < 10_000_000)
        return { bg: "bg-teal-500 hover:bg-teal-600", text: "text-white" };
    else if (viewsNum < 100_000_000)
        return { bg: "bg-violet-500 hover:bg-violet-600", text: "text-white" };

    return { bg: "bg-green-500 hover:bg-green-600", text: "text-white" };
};

export async function MangaDetailsComponent({ id }: { id: string }) {
    "use cache";
    cacheLife("minutes");

    const manga = await fetchMangaDetails(id);
    if ("error" in manga) {
        return (
            <div className="mx-auto p-4">
                <ErrorComponent message={manga.error.message} />
            </div>
        );
    }

    manga.alternativeNames = manga.alternativeNames?.filter(
        (name: string) => name.trim() !== "",
    );

    let score = manga.score;
    const malScore = manga.malData?.score;
    if (malScore !== undefined) {
        score = malScore / 2;
    }

    return (
        <div className="mx-auto p-4 pb-0">
            <div className="flex flex-col justify-center gap-4 lg:flex-row mb-4 items-stretch h-auto">
                {/* Image and Details Section */}
                <div className="flex flex-shrink-0 justify-center">
                    <EnhancedImage
                        src={imageUrl(
                            manga.malData?.imageUrl ?? manga.imageUrl,
                        )}
                        alt={manga.name}
                        className="rounded-lg shadow-lg object-cover h-auto max-w-lg min-w-full w-full lg:h-[600px]"
                        hoverEffect="dynamic-tilt"
                        width={400}
                        height={600}
                        priority={true}
                    />
                </div>

                {/* Card with flex layout to lock title and buttons */}
                <Card className="p-6 flex flex-col justify-between flex-grow lg:max-h-[600px]">
                    {/* Title stays at the top */}
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold">{manga.name}</h1>
                            {manga.alternativeNames &&
                                manga.alternativeNames.length > 0 && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <InfoIcon className="w-5 h-5 hidden lg:block" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <div className="flex flex-wrap gap-2 max-w-96 w-auto">
                                                    {manga.alternativeNames.map(
                                                        (
                                                            mangaName: string,
                                                            index: number,
                                                        ) => (
                                                            <p
                                                                className="max-w-xs bg-accent px-1 rounded"
                                                                key={index}
                                                            >
                                                                {mangaName}
                                                            </p>
                                                        ),
                                                    )}
                                                </div>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                        </div>
                        <div className="flex flex-shrink-0 flex-col gap-2 lg:gap-0 lg:flex-row">
                            {manga.malData?.aniUrl && (
                                <Link
                                    href={manga.malData.aniUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
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
                            {manga.malData?.malUrl && (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={manga.malData.malUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                                </div>
                            )}
                        </div>
                    </div>

                    {manga.alternativeNames &&
                        manga.alternativeNames.length > 0 && (
                            <div className="border-b pb-4 mb-4 lg:hidden">
                                <span className="px-1 rounded opacity-70">
                                    {manga.alternativeNames
                                        .map((name: string) => name.trim())
                                        .join(" | ")}
                                </span>
                            </div>
                        )}

                    {/* Middle section grows as needed */}
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 flex-grow overflow-hidden">
                        {/* Left section for the manga details */}
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div>
                                <div className="text-lg mb-2">
                                    Authors:
                                    {manga.authors.map(
                                        (author: string, index: number) => (
                                            <Link
                                                href={`/author/${encodeURIComponent(author.replaceAll(" ", "-"))}`}
                                                key={index}
                                                prefetch={false}
                                            >
                                                <Badge
                                                    withShadow={true}
                                                    className="bg-primary text-secondary ml-2 hover:bg-gray-300"
                                                    shadowClassName="ml-2 mt-[5px]"
                                                >
                                                    {author}
                                                </Badge>
                                            </Link>
                                        ),
                                    )}
                                </div>
                                <div className="text-lg mb-2 flex items-center">
                                    Status:
                                    <Badge
                                        className={`${getStatusColor(
                                            manga.status,
                                        )} text-white ml-2`}
                                    >
                                        {manga.status}
                                    </Badge>
                                </div>
                                <div className="text-lg mb-2 flex items-center">
                                    Updated:
                                    <Badge className="ml-2 hover:bg-gray-300">
                                        {manga.updated}
                                    </Badge>
                                </div>
                                <div className="text-lg mb-2 flex items-center">
                                    Views:
                                    <Badge
                                        className={`${getViewsColor(manga.view).bg} ${
                                            getViewsColor(manga.view).text
                                        } ml-2`}
                                    >
                                        {manga.view}
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
                                                    genre.replaceAll(" ", "_"),
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
                                <div className="mt-4 flex-grow block lg:hidden xl:block lg:mb-4">
                                    <ScoreDisplay score={score} />
                                </div>
                            </div>

                            {/* Bookmark and Start Reading Buttons */}
                            <Buttons manga={manga} />
                        </div>
                        {/* Right section for the description */}
                        <div className="lg:w-1/2 flex-grow h-full">
                            <Card
                                className="w-full h-full max-h-96 lg:max-h-none p-4 overflow-y-auto"
                                aria-label="Description"
                                role="region"
                            >
                                <p>
                                    {manga.malData?.description ??
                                        manga.description}
                                </p>
                            </Card>
                        </div>
                    </div>
                </Card>
            </div>

            <ChaptersSection manga={manga} />
        </div>
    );
}

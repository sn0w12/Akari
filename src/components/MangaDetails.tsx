"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React from "react";
import ScoreDisplay from "@/components/ui/MangaDetails/scoreDisplay";
import Buttons from "./ui/MangaDetails/Buttons";
import { fetchMalData } from "@/lib/malSync";
import EnhancedImage from "./ui/enhancedImage";
import { ChaptersSection } from "./ui/MangaDetails/ChaptersSection";
import MangaDetailsSkeleton from "@/components/ui/MangaDetails/mangaDetailsSkeleton";
import { HqMangaCacheItem, MangaDetails } from "@/app/api/interfaces";

async function getMangaDetails(id: string) {
    const response = await fetch(`/api/manga/${id}`);

    if (!response.ok) {
        throw new Error("Failed to fetch manga");
    }

    return response.json();
}

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

const formatDate = (date: string) => {
    const dateArray = date.split(",");
    const year = dateArray[1].split("-")[0].trim();
    return dateArray[0] + ", " + year;
};

export function MangaDetailsComponent({ id }: { id: string }) {
    const [manga, setManga] = useState<MangaDetails | null>(null);
    const [malData, setMalData] = useState<HqMangaCacheItem | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mangaData, malResult] = await Promise.all([
                    getMangaDetails(id),
                    fetchMalData(id),
                ]);
                setManga(mangaData);
                setMalData(malResult);
                document.title = mangaData?.name;
            } catch (error) {
                console.error("Error fetching manga details:", error);
            }
        };

        fetchData();
    }, [id]);

    if (!manga) {
        return <MangaDetailsSkeleton />;
    }

    return (
        <main className="container mx-auto px-4 py-8">
            <div className="flex flex-col justify-center gap-4 lg:flex-row lg:gap-8 mb-8 items-stretch h-auto">
                {/* Image and Details Section */}
                <div className="flex flex-shrink-0 justify-center">
                    <EnhancedImage
                        src={malData?.imageUrl ?? manga.imageUrl}
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
                        <h1 className="text-3xl font-bold">{manga.name}</h1>
                        <div className="flex flex-shrink-0 flex-col gap-2 lg:gap-0 lg:flex-row">
                            {malData?.aniUrl && (
                                <a
                                    href={malData.aniUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Image
                                        src="/img/AniList-logo.webp"
                                        alt="AniList Logo"
                                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                                        width={40}
                                        height={40}
                                    />
                                </a>
                            )}
                            {malData?.malUrl && (
                                <a
                                    href={malData.malUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Image
                                        src="/img/MAL-logo.webp"
                                        alt="MyAnimeList Logo"
                                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                                        width={40}
                                        height={40}
                                    />
                                </a>
                            )}
                        </div>
                    </div>

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
                                                href={`/author/${encodeURIComponent(
                                                    manga.author_urls[index]
                                                        ?.split("/")
                                                        .pop() || "",
                                                )}`}
                                                key={index}
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
                                        {formatDate(manga.updated)}
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
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        Genres:
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {manga.genres.map((genre: string) => (
                                            <Link
                                                key={genre}
                                                href={`/genre/${encodeURIComponent(
                                                    genre.replaceAll(" ", "_"),
                                                )}`}
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
                                <div className="mt-4 lg:mb-4 flex-grow h-full">
                                    <ScoreDisplay score={manga.score} />
                                </div>
                            </div>

                            {/* Bookmark and Start Reading Buttons */}
                            <Buttons manga={manga} />
                        </div>
                        {/* Right section for the description */}
                        <div className="lg:w-1/2 flex-grow h-full">
                            <Card className="w-full h-full max-h-96 lg:max-h-none p-4 overflow-y-auto">
                                <p>
                                    {malData?.description ?? manga.description}
                                </p>
                            </Card>
                        </div>
                    </div>
                </Card>
            </div>

            <ChaptersSection manga={manga} />
        </main>
    );
}

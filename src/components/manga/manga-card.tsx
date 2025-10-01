"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { SmallManga } from "@/types/manga";
import Link from "next/link";
import { imageUrl } from "@/lib/utils";

interface MangaCardProps {
    manga: SmallManga;
    loading?: "eager" | "lazy";
    priority?: boolean;
    isBookmarked?: boolean;
}

export function MangaCard({
    manga,
    loading = "lazy",
    priority = false,
    isBookmarked = false,
}: MangaCardProps) {
    return (
        <Link
            href={`/manga/${manga.id}`}
            className="block h-fit"
            prefetch={false}
        >
            <Card
                className={`group relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 p-0 ${
                    isBookmarked ? "border-[3px] border-accent-color" : ""
                }`}
            >
                <CardContent className="p-0">
                    <Image
                        src={imageUrl(manga.image)}
                        alt={manga.title}
                        width={250}
                        height={350}
                        className="w-full h-auto object-cover"
                        loading={loading}
                        priority={priority}
                    />
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out will-change-opacity transform-gpu"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="font-bold text-sm mb-1">
                                {manga.title}
                            </h3>
                            {manga.author && manga.author.length > 0 && (
                                <p className="text-xs">
                                    {`Author${
                                        manga.author.split(",").length > 1
                                            ? "s"
                                            : ""
                                    }: `}
                                    {manga.author
                                        .split(",")
                                        .map((author) => author.trim())
                                        .join(" | ")}
                                </p>
                            )}
                            <p className="text-xs">Chapter: {manga.chapter}</p>
                            {manga.views !== "" && (
                                <p className="text-xs">Views: {manga.views}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

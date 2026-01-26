"use client";

import { DeviceType } from "@/contexts/device-context";
import { cn, generateSizes } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    useCarousel,
} from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";

interface PopularMangaProps {
    manga: components["schemas"]["MangaResponse"][];
    deviceType: DeviceType;
}

export function PopularManga({ manga, deviceType }: PopularMangaProps) {
    const totalPriorityItems = deviceType === "mobile" ? 1 : 2;

    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent>
                {manga.map((mangaItem, index) => (
                    <CarouselItem
                        key={mangaItem.id}
                        className="pl-4 pr-[1px] 2xl:basis-1/2"
                    >
                        <PopularMangaCard
                            manga={mangaItem}
                            priority={index < totalPriorityItems}
                        />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselControls />
        </Carousel>
    );
}

function CarouselControls() {
    const { scrollNext, canScrollNext, scrollPrev, canScrollPrev, api } =
        useCarousel();
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrentPage(api.selectedScrollSnap() + 1);
            setTotalPages(api.scrollSnapList().length);
        };

        onSelect(); // Initial update
        api.on("select", onSelect);

        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    return (
        <div className="flex items-center gap-2 pt-2 w-full justify-between sm:p-0 sm:w-auto sm:absolute sm:bottom-2 sm:right-2">
            <span className="order-2 sm:order-1 text-sm text-muted-foreground">
                {currentPage} / {totalPages}
            </span>
            <Button
                size="icon"
                className="order-1 sm:order-2"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
            >
                <ArrowLeft />
                <span className="sr-only">Previous slide</span>
            </Button>
            <Button
                size="icon"
                className="order-3"
                disabled={!canScrollNext}
                onClick={scrollNext}
            >
                <ArrowRight />
                <span className="sr-only">Next slide</span>
            </Button>
        </div>
    );
}

function PopularMangaCardInfo({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="line-clamp-1 text-lg text-foreground">{value}</p>
        </div>
    );
}

interface PopularMangaCardProps {
    manga: components["schemas"]["MangaResponse"];
    priority?: boolean;
}

function PopularMangaCard({ manga, priority }: PopularMangaCardProps) {
    return (
        <Link
            href={`/manga/${manga.id}`}
            className="flex flex-row h-full w-full rounded-lg border bg-card"
        >
            <Image
                src={manga.cover}
                alt={manga.title}
                className="h-auto w-full sm:w-64 object-cover rounded-l-lg rounded-r-lg sm:rounded-r-none"
                width={200}
                height={300}
                quality={80}
                loading={priority ? "eager" : "lazy"}
                preload={priority}
                decoding="async"
                sizes={generateSizes({
                    sm: "400px",
                    md: "240px",
                })}
            />
            <div className="space-y-2 py-2 px-4 w-full hidden sm:block">
                <h2 className="line-clamp-2 text-3xl font-semibold leading-tight text-card-foreground border-b pb-1">
                    {manga.title}
                </h2>

                <PopularMangaCardInfo
                    label="Author"
                    value={manga.authors.join(", ")}
                />
                <PopularMangaCardInfo label="Status" value={manga.status} />
                <PopularMangaCardInfo label="Type" value={manga.type} />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                        Genres
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {manga.genres.slice(0, 6).map((genre) => (
                            <Badge variant="secondary" key={genre}>
                                {genre}
                            </Badge>
                        ))}
                        {manga.genres.length > 6 && (
                            <Badge variant="secondary">
                                +{manga.genres.length - 6}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export function PopularMangaSkeleton() {
    return (
        <div className="w-full grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <PopularMangaSkeletonCard />
            <PopularMangaSkeletonCard className="hidden 2xl:block" />
        </div>
    );
}

function PopularMangaSkeletonCard({ className }: { className?: string }) {
    return (
        <div className={cn("w-full", className)}>
            <div className="overflow-hidden">
                <div className="flex">
                    <div className="min-w-0 flex-shrink-0 flex-grow-0 pr-[1px] basis-full">
                        <div className="flex flex-row h-full w-full rounded-lg border bg-card">
                            <Skeleton className="aspect-[2/3] sm:h-[384px] w-full sm:w-64 rounded-l-lg rounded-r-lg sm:rounded-r-none" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 pt-2 w-full justify-between sm:p-0 sm:w-auto sm:absolute sm:bottom-2 sm:right-2">
                <Skeleton className="order-2 sm:order-1 h-5 w-12" />
                <Skeleton className="order-1 sm:order-2 h-10 w-10" />
                <Skeleton className="order-3 h-10 w-10" />
            </div>
        </div>
    );
}

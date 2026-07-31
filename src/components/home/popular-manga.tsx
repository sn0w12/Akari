import { Image } from "@/components/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { sortGenresByCategory } from "@/lib/api/search";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GenreBadge } from "../manga-details/badges/genre";
import { StatusBadge } from "../manga-details/badges/status";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    useCarousel,
} from "../ui/carousel";

interface PopularMangaProps {
    manga: components["schemas"]["MangaResponse"][];
}

export function PopularManga({ manga }: PopularMangaProps) {
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
                        className="pl-4 pr-[1px] basis-1/2 sm:basis-full 2xl:basis-1/2"
                    >
                        <PopularMangaCard
                            manga={mangaItem}
                            priority={index < 2}
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
                aria-label="Previous slide"
                size="icon"
                className="order-1 sm:order-2"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
            >
                <ArrowLeft />
            </Button>
            <Button
                aria-label="Next slide"
                size="icon"
                className="order-3"
                disabled={!canScrollNext}
                onClick={scrollNext}
            >
                <ArrowRight />
            </Button>
        </div>
    );
}

function PopularMangaCardInfo({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {children}
        </div>
    );
}

interface PopularMangaCardProps {
    manga: components["schemas"]["MangaResponse"];
    priority?: boolean;
}

function PopularMangaCard({ manga, priority }: PopularMangaCardProps) {
    const sortedGenres = sortGenresByCategory(manga.genres);

    return (
        <Card>
            <Link
                to="/manga/$mangaId"
                params={{ mangaId: manga.id }}
                className="flex flex-row h-full w-full"
            >
                <Image
                    src={manga.cover.url}
                    thumbHash={manga.cover.thumbhash}
                    alt={manga.title}
                    className="h-auto w-full sm:w-64 object-cover rounded-l-2xl rounded-r-2xl sm:rounded-r-none"
                    width={160}
                    height={240}
                    fetchPriority={priority ? "high" : "auto"}
                    decoding="async"
                    sizes={{
                        default: "50vw",
                        sm: 240,
                    }}
                    quality={40}
                />
                <div className="space-y-2 py-2 px-4 w-full hidden sm:block">
                    <h2 className="line-clamp-2 text-3xl font-semibold leading-tight text-card-foreground border-b pb-1">
                        {manga.title}
                    </h2>

                    <PopularMangaCardInfo label="Author">
                        <div className="flex flex-wrap gap-1">
                            {[...new Set(manga.authors)].map((author) => (
                                <Badge key={`${manga.id}-${author}`} size="lg">
                                    {author}
                                </Badge>
                            ))}
                        </div>
                    </PopularMangaCardInfo>
                    <PopularMangaCardInfo label="Status">
                        <StatusBadge status={manga.status} size="lg" />
                    </PopularMangaCardInfo>
                    <PopularMangaCardInfo label="Type">
                        <Badge size="lg">{manga.type}</Badge>
                    </PopularMangaCardInfo>
                    <PopularMangaCardInfo label="Genres">
                        <div className="flex flex-wrap gap-1">
                            {sortedGenres.slice(0, 6).map((genre) => (
                                <GenreBadge
                                    key={`${manga.id}-${genre}`}
                                    genre={genre}
                                    size="lg"
                                />
                            ))}
                            {sortedGenres.length > 6 && (
                                <GenreBadge
                                    genre={`+${sortedGenres.length - 6}`}
                                    size="lg"
                                />
                            )}
                        </div>
                    </PopularMangaCardInfo>
                </div>
            </Link>
        </Card>
    );
}

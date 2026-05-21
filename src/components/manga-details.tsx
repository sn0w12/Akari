import { Image, type SizesConfig } from "@/components/image";
import { Badge, BadgeVariantProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { createJsonLd } from "@/lib/seo";
import { formatNumberShort, pluralize } from "@/lib/utils";
import type { components } from "@/types/api";
import { Link } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { Suspense } from "react";
import { ComicSeries, Person } from "schema-dts";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import Buttons from "./manga-details/buttons";
import { ScoreDisplay } from "./manga-details/score/score-display";
import {
    MangaUpdatedAt,
    MangaUpdatedAtFallback,
} from "./manga-details/updated-at";
import { ViewManga } from "./manga-details/view-manga";

export const MANGA_DETAILS_COVER_IMAGE_SIZES = {
    default: "200px",
    sm: 128,
    lg: 400,
} satisfies SizesConfig;

const getStatusVariant = (status: string): BadgeVariantProps["variant"] => {
    switch (status.toLowerCase()) {
        case "ongoing":
            return "positive";
        case "completed":
            return "info";
        case "hiatus":
            return "warning";
        default:
            return "default";
    }
};

const getViewsColor = (views: number): string => {
    if (views < 100) return "bg-[#ffc659] hover:bg-[#ffc659] text-black";
    else if (views < 1_000) return "bg-[#ff8f70] hover:bg-[#ff8f70] text-black";
    else if (views < 10_000)
        return "bg-[#ff609e] hover:bg-[#ff609e] text-white";
    else if (views < 100_000)
        return "bg-[#e255d0] hover:bg-[#e255d0] text-white";

    return "bg-accent-positive hover:bg-accent-positive text-white";
};

function ExternalLinks({
    manga,
}: {
    manga: components["schemas"]["MangaResponse"];
}) {
    return (
        <>
            {manga.aniId && (
                <a
                    href={`https://anilist.co/manga/${manga.aniId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                >
                    <Image
                        src="/img/icons/AniList-logo.webp"
                        alt="AniList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                        sizes={{ default: "40px" }}
                    />
                </a>
            )}
            {manga.malId && (
                <a
                    href={`https://myanimelist.net/manga/${manga.malId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                >
                    <Image
                        src="/img/icons/MAL-logo.webp"
                        alt="MyAnimeList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                        sizes={{ default: "40px" }}
                    />
                </a>
            )}
        </>
    );
}

export function MangaDetailsComponent({
    manga,
}: {
    manga: components["schemas"]["MangaResponse"];
}) {
    const alternativeTitles = (manga.alternativeTitles || []).filter(
        (title) => title.toLowerCase() !== manga.title.toLowerCase(),
    );
    const jsonLd = createJsonLd<ComicSeries>({
        "@type": "ComicSeries",
        url: `/manga/${manga.id}`,
        name: manga.title,
        alternateName: alternativeTitles.join(", "),
        image: manga.cover,
        description: manga.description,
        genre: manga.genres,
        author: manga.authors.map((author) =>
            createJsonLd<Person>({
                "@type": "Person",
                url: `/author/${encodeURIComponent(author.replaceAll(" ", "-"))}`,
                name: author,
            }),
        ),
        datePublished: manga.createdAt,
        dateModified: manga.updatedAt,
        aggregateRating:
            manga.rating.average > 0
                ? {
                      "@type": "AggregateRating",
                      ratingValue: manga.rating.average,
                      ratingCount: manga.rating.total,
                      bestRating: 10,
                      worstRating: 0,
                  }
                : undefined,
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
                }}
            />
            <BreadcrumbSetter orig={manga.id} title={manga.title} />
            <div className="mb-2 flex h-auto flex-col justify-center gap-4 items-stretch lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-0">
                <div className="mb-4 flex items-center justify-between border-b pb-4 lg:contents">
                    <div className="mr-4 flex flex-shrink-0 justify-center lg:col-start-1 lg:row-span-2 lg:mr-0 lg:block lg:w-[400px]">
                        <Image
                            src={manga.cover}
                            alt={manga.title}
                            className="rounded-lg object-cover h-auto w-24 sm:w-30 md:w-40 lg:h-[600px] lg:w-full"
                            width={400}
                            height={600}
                            loading="eager"
                            quality={60}
                            sizes={MANGA_DETAILS_COVER_IMAGE_SIZES}
                        />
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between lg:col-start-2 lg:row-start-1 lg:mb-4 lg:border-b lg:pb-4">
                        <div className="flex min-w-0 items-center gap-2">
                            <h1 className="overflow-y-auto text-2xl font-bold md:text-3xl lg:max-h-27">
                                {manga.title}
                            </h1>
                            {alternativeTitles.length > 0 && (
                                <Tooltip>
                                    <TooltipTrigger
                                        className="hidden lg:block"
                                        aria-label="Alternative Names"
                                    >
                                        <InfoIcon className="w-5 h-5" />
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom">
                                        <div className="flex flex-col gap-1 max-w-96 w-auto">
                                            {alternativeTitles.map(
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
                        <div className="flex flex-shrink-0 flex-col gap-2 lg:flex-row lg:gap-0">
                            <ExternalLinks manga={manga} />
                        </div>
                    </div>
                </div>

                {/* Card with flex layout to lock title and buttons */}
                <div className="flex flex-col justify-between flex-grow bg-background gap-0 lg:col-start-2 lg:row-start-2 lg:max-h-[600px]">
                    {/* Middle section grows as needed */}
                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 flex-grow overflow-hidden">
                        {/* Left section for the manga details */}
                        <div className="lg:w-1/2 flex flex-col justify-between">
                            <div className="grid grid-cols-2 gap-2 mb-2">
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
                                                    to="/author/$id"
                                                    params={{
                                                        id: encodeURIComponent(
                                                            author.replaceAll(
                                                                " ",
                                                                "-",
                                                            ),
                                                        ),
                                                    }}
                                                    key={index}
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
                                        variant={getStatusVariant(manga.status)}
                                    >
                                        {manga.status.charAt(0).toUpperCase() +
                                            manga.status.slice(1)}
                                    </Badge>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Updated:
                                    </div>
                                    <Suspense
                                        fallback={<MangaUpdatedAtFallback />}
                                    >
                                        <MangaUpdatedAt
                                            updatedAt={manga.updatedAt}
                                        />
                                    </Suspense>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Views:
                                    </div>
                                    <Badge
                                        className={getViewsColor(manga.views)}
                                    >
                                        {formatNumberShort(manga.views)}
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
                                                to="/genre/$id"
                                                params={{
                                                    id: encodeURIComponent(
                                                        genre.replaceAll(
                                                            " ",
                                                            "-",
                                                        ),
                                                    ),
                                                }}
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
                                <div className="my-2 flex-grow">
                                    <ScoreDisplay
                                        mangaId={manga.id}
                                        rating={manga.rating}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mt-auto">
                                <Buttons manga={manga} />
                            </div>
                        </div>
                        {/* Right section for the description */}
                        <div className="lg:w-1/2 flex-grow h-full flex flex-col">
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

            <ViewManga mangaId={manga.id} />
        </>
    );
}

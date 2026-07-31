import { Image, type SizesConfig } from "@/components/image";
import { JsonLd } from "@/components/json-ld";
import { Badge, BadgeVariantProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { sortGenresByCategory } from "@/lib/api/search";
import { createJsonLd } from "@/lib/seo";
import { formatNumberShort, getTrackerId, pluralize } from "@/lib/utils";
import type { components } from "@/types/api";
import { Link } from "@tanstack/react-router";
import { ComicSeries, Person } from "schema-dts";
import { BreadcrumbSetter } from "./breadcrumb-setter";
import { GenreBadge } from "./manga-details/badges/genre";
import { StatusBadge } from "./manga-details/badges/status";
import Buttons from "./manga-details/buttons";
import { ScoreDisplay } from "./manga-details/score/score-display";
import { MangaUpdatedAt } from "./manga-details/updated-at";
import { ViewManga } from "./manga-details/view-manga";
import { AlternativeTitlesPopover } from "./manga-details/alternative-titles";

export const MANGA_DETAILS_COVER_IMAGE_SIZES = {
    default: "200px",
    sm: 128,
    lg: 400,
} satisfies SizesConfig;

const getViewsVariant = (views: number): BadgeVariantProps["variant"] => {
    if (views < 100) return "warning";
    else if (views < 1_000) return "info";
    else if (views < 10_000) return "destructive";

    return "success";
};

function ExternalLinks({
    manga,
}: {
    manga: components["schemas"]["MangaResponse"];
}) {
    const ani = getTrackerId(manga.trackers, "anilist");
    const mal = getTrackerId(manga.trackers, "myanimelist");

    return (
        <>
            {ani && (
                <a
                    href={`https://anilist.co/manga/${ani}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                >
                    <img
                        src="/img/icons/AniList-logo.webp"
                        alt="AniList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
                    />
                </a>
            )}
            {mal && (
                <a
                    href={`https://myanimelist.net/manga/${mal}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10"
                >
                    <img
                        src="/img/icons/MAL-logo.webp"
                        alt="MyAnimeList Logo"
                        className="h-10 ml-2 rounded hover:opacity-75 transition-opacity duration-300 ease-out"
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
    const sortedGenres = sortGenresByCategory(manga.genres);
    const jsonLd = createJsonLd<ComicSeries>({
        "@type": "ComicSeries",
        url: `/manga/${manga.id}`,
        name: manga.title,
        alternateName: manga.alternativeTitles
            ?.map((title) => title.title)
            .join(", "),
        image: manga.cover.url,
        description: manga.description,
        genre: sortedGenres,
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
            <JsonLd data={jsonLd} />
            <BreadcrumbSetter orig={manga.id} title={manga.title} />
            <div className="mb-2 flex h-auto flex-col justify-center gap-4 items-stretch lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-y-0">
                <div className="mb-4 flex items-center justify-between border-b pb-4 lg:contents">
                    <div className="mr-4 flex flex-shrink-0 justify-center lg:col-start-1 lg:row-span-2 lg:mr-0 lg:block lg:w-[400px]">
                        <Image
                            src={manga.cover.url}
                            thumbHash={manga.cover.thumbhash}
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
                            <h1 className="overflow-y-auto text-2xl font-semibold md:text-3xl lg:max-h-27">
                                {manga.title}
                            </h1>
                            {manga.alternativeTitles && (
                                <AlternativeTitlesPopover
                                    titles={manga.alternativeTitles}
                                />
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
                    <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 flex-grow">
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
                                        {[...new Set(manga.authors)].map(
                                            (author: string) => (
                                                <Badge
                                                    key={`${manga.id}-${author}`}
                                                    variant="default"
                                                    render={
                                                        <Link
                                                            to="/author/$authorId"
                                                            params={{
                                                                authorId:
                                                                    encodeURIComponent(
                                                                        author.replaceAll(
                                                                            " ",
                                                                            "-",
                                                                        ),
                                                                    ),
                                                            }}
                                                        />
                                                    }
                                                >
                                                    {author}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-lg font-semibold">
                                        Status:
                                    </div>
                                    <StatusBadge status={manga.status} />
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
                                        variant={getViewsVariant(manga.views)}
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
                                        {sortedGenres.map((genre: string) => (
                                            <GenreBadge
                                                key={`${manga.id}-${genre}`}
                                                genre={genre}
                                            />
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
                                className="w-full h-full max-h-60 md:max-h-96 lg:max-h-[527px] p-4 overflow-y-auto"
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

import { GRID_CLASS } from "@/components/grid-page";
import { InstallPrompt } from "@/components/home/install-prompt";
import { NotificationPrompt } from "@/components/home/notification-prompt";
import { PopularManga } from "@/components/home/popular-manga";
import { RemotePrompts } from "@/components/home/remote-prompts";
import { MangaCard } from "@/components/manga/manga-card";
import MangaCardSkeleton from "@/components/manga/manga-card-skeleton";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { PromptStack } from "@/components/ui/prompt-stack";
import { client, serverHeaders } from "@/lib/api";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { env } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Suspense } from "react";

const getPopularSection = createServerFn({ method: "GET" }).handler(
    async () => {
        const { data, error } = await client.GET("/v2/manga/list/popular", {
            params: {
                query: {
                    page: 1,
                    pageSize: 24,
                    days: 7,
                    excludedGenres: ["Hentai", "Adult"],
                },
            },
            headers: serverHeaders,
        });
        return { data: data?.data.items ?? null, error };
    },
);

const getLatestSection = createServerFn({ method: "GET" }).handler(async () => {
    const { data, error } = await client.GET("/v2/manga/list", {
        params: { query: { page: 1, pageSize: 24 } },
        headers: serverHeaders,
    });
    return { data: data?.data ?? null, error };
});

export const Route = createFileRoute("/_default/")({
    loader: async () => {
        const [popular, latest] = await Promise.all([
            getPopularSection(),
            getLatestSection(),
        ]);
        return { popular: popular.data, latest: latest.data };
    },
    head: () =>
        createMetadata({
            title: "Akari Manga",
            description:
                "Browse popular manga and the latest releases on Akari.",
            canonicalPath: "/",
            image: "/og/akari.webp",
        }),
    component: Home,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ minutes: 5 })
            .staleWhileRevalidate({ minutes: 15 })
            .public()
            .build(),
    }),
});

function Home() {
    const { popular, latest } = Route.useLoaderData();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        url: "/",
                        name: "Akari Manga",
                        description: "Read manga for free on Akari.",
                        potentialAction: {
                            "@type": "SearchAction",
                            target: {
                                "@type": "EntryPoint",
                                urlTemplate: `https://${env("VITE_HOST") || ""}/search?q={search_term_string}`,
                            },
                            "query-input": "required name=search_term_string",
                        },
                    }).replace(/</g, "\\u003c"),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        url: "/",
                        itemListElement: [
                            {
                                "@type": "ListItem",
                                position: 1,
                                name: "Home",
                                item: "/",
                            },
                            {
                                "@type": "ListItem",
                                position: 2,
                                name: "Popular",
                                item: "/popular",
                            },
                            {
                                "@type": "ListItem",
                                position: 3,
                                name: "Latest",
                                item: "/latest",
                            },
                            {
                                "@type": "ListItem",
                                position: 4,
                                name: "Search",
                                item: "/search",
                            },
                            {
                                "@type": "ListItem",
                                position: 5,
                                name: "Bookmarks",
                                item: "/bookmarks",
                            },
                            {
                                "@type": "ListItem",
                                position: 6,
                                name: "Lists",
                                item: "/lists",
                            },
                        ],
                    }).replace(/</g, "\\u003c"),
                }}
            />
            <div className="flex-1 px-4 pt-2 pb-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Popular Manga</h2>
                    {popular ? <PopularManga manga={popular} /> : null}
                </div>

                <Suspense
                    fallback={
                        <>
                            <h2 className="text-3xl font-bold mb-2">
                                Recently Viewed
                            </h2>
                            <div className={GRID_CLASS}>
                                {[...Array(8)].map((_, index) => (
                                    <MangaCardSkeleton
                                        key={`recent-skeleton-${index}`}
                                    />
                                ))}
                            </div>
                        </>
                    }
                >
                    <HomeRecent />
                </Suspense>

                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
                {latest ? (
                    <>
                        <MangaGrid mangaList={latest.items} priority={2} />
                        <ServerPagination
                            currentPage={1}
                            href="/latest"
                            totalPages={latest.totalPages}
                            className="mt-4"
                        />
                    </>
                ) : null}
            </div>
            <PromptStack>
                <InstallPrompt />
                <NotificationPrompt />
                <Suspense fallback={null}>
                    <RemotePrompts />
                </Suspense>
            </PromptStack>
        </>
    );
}

function HomeRecent() {
    const { data } = useQuery({
        queryKey: ["recently-viewed"],
        queryFn: async () => {
            const { data } = await client.GET("/v2/manga/viewed", {
                params: { query: { limit: 8 } },
            });
            return data?.data ?? [];
        },
        staleTime: 1000 * 60 * 5,
    });

    if (!data || data.length === 0) return null;

    return (
        <>
            <h2 className="text-3xl font-bold mb-2">Recently Viewed</h2>
            <div className={GRID_CLASS}>
                {data.map((manga, index) => (
                    <MangaCard
                        key={manga.id}
                        manga={manga}
                        priority={index < 2}
                        className={
                            index > 5
                                ? "block sm:hidden lg:block 2xl:hidden"
                                : ""
                        }
                    />
                ))}
            </div>
        </>
    );
}

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
import { getAuthToken } from "@/lib/auth/server";
import { createJsonLd, createMetadata } from "@/lib/seo";
import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { BreadcrumbList, ListItem, WebSite } from "schema-dts";
import { getLatestData } from "./latest/page";
import { getPopularData } from "./popular/page";

export const metadata: Metadata = createMetadata({
    title: "Akari Manga",
    description: "Read manga for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/",
    pagination: {
        next: "/latest/2",
    }
});

export default async function Home() {
    const siteUrl = `https://${process.env.NEXT_PUBLIC_HOST}`;

    const websiteJsonLd = createJsonLd<WebSite>({
        "@type": "WebSite",
        url: "/",
        name: "Akari Manga",
        description: "Read manga for free on Akari.",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        } as never,
    });

    const breadcrumbJsonLd = createJsonLd<BreadcrumbList>({
        "@type": "BreadcrumbList",
        url: "/",
        itemListElement: [
            createJsonLd<ListItem>({
                "@type": "ListItem",
                url: "/",
                position: 1,
                name: "Home",
            }),
            createJsonLd<ListItem>({
                "@type": "ListItem",
                url: "/popular",
                position: 2,
                name: "Popular",
            }),
            createJsonLd<ListItem>({
                "@type": "ListItem",
                url: "/latest",
                position: 3,
                name: "Latest",
            }),
            createJsonLd<ListItem>({
                "@type": "ListItem",
                url: "/search",
                position: 4,
                name: "Search",
            }),
            createJsonLd<ListItem>({
                "@type": "ListItem",
                url: "/bookmarks",
                position: 5,
                name: "Bookmarks",
            }),
            createJsonLd<ListItem>({
                "@type": "ListItem",
                url: "/lists",
                position: 6,
                name: "Lists",
            }),
        ],
    });

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteJsonLd).replace(
                        /</g,
                        "\\u003c",
                    ),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbJsonLd).replace(
                        /</g,
                        "\\u003c",
                    ),
                }}
            />
            <div className="flex-1 px-4 pt-2 pb-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Popular Manga</h2>
                    <HomePopular />
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
                                        className={
                                            index > 5
                                                ? "block sm:hidden lg:block 2xl:hidden"
                                                : ""
                                        }
                                    />
                                ))}
                            </div>
                        </>
                    }
                >
                    <HomeRecent />
                </Suspense>

                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
                <HomeLatest />
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

async function HomePopular() {
    const { data, error } = await getPopularData(1, 7);

    if (error || !data) {
        return null;
    }

    return <PopularManga manga={data.data.items} />;
}

async function HomeLatest() {
    const { data, error } = await getLatestData(1);

    if (error || !data) {
        return null;
    }

    return (
        <>
            <MangaGrid mangaList={data.data.items} priority={2} />
            <ServerPagination
                currentPage={1}
                href="./latest"
                totalPages={data.data.totalPages}
                className="mt-4"
            />
        </>
    );
}
async function getViewedManga(token: string) {
    "use cache";
    cacheLife("minutes");

    const { data, error } = await client.GET("/v2/manga/viewed", {
        params: {
            query: {
                limit: 8,
            },
        },
        headers: {
            ...serverHeaders,
            Authorization: `Bearer ${token}`,
        },
    });

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

async function HomeRecent() {
    const token = await getAuthToken();
    if (!token) {
        return null;
    }

    const { data, error } = await getViewedManga(token);
    if (error || !data || data.data.length === 0) {
        return null;
    }

    return (
        <>
            <h2 className="text-3xl font-bold mb-2">Recently Viewed</h2>
            <div className={GRID_CLASS}>
                {data.data.map((manga, index) => (
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

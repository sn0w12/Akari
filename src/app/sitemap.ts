import { client } from "@/lib/api";
import { serverHeaders } from "@/lib/api";
import type { MetadataRoute } from "next";

const NEXT_PUBLIC_HOST = process.env.NEXT_PUBLIC_HOST!;

type SitemapEntry = MetadataRoute.Sitemap[number];

const staticPages: SitemapEntry[] = [
    {
        url: `https://${NEXT_PUBLIC_HOST}/`,
        lastModified: new Date(),
        changeFrequency: "hourly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/about`,
        lastModified: new Date(),
        changeFrequency: "monthly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/privacy`,
        lastModified: new Date(),
        changeFrequency: "monthly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/terms`,
        lastModified: new Date(),
        changeFrequency: "monthly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/login`,
        lastModified: new Date(),
        changeFrequency: "monthly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/register`,
        lastModified: new Date(),
        changeFrequency: "monthly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/settings`,
        lastModified: new Date(),
        changeFrequency: "monthly",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/search`,
        lastModified: new Date(),
        changeFrequency: "daily",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/popular`,
        lastModified: new Date(),
        changeFrequency: "daily",
    },
    {
        url: `https://${NEXT_PUBLIC_HOST}/latest`,
        lastModified: new Date(),
        changeFrequency: "hourly",
    },
];

function mangaToSitemapEntry(
    manga: components["schemas"]["MangaResponse"]
): SitemapEntry {
    return {
        url: `https://${NEXT_PUBLIC_HOST}/manga/${manga.id}`,
        lastModified: new Date(manga.updatedAt),
        images: [manga.cover],
        changeFrequency: ["completed", "hiatus"].includes(manga.status)
            ? "monthly"
            : "weekly",
    };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    if (process.env.GENERATE_SITEMAP !== "1") return [];

    try {
        const allUrls: SitemapEntry[] = [];
        allUrls.push(...staticPages);

        const { data: firstPageData, error: firstError } = await client.GET(
            "/v2/manga/list",
            {
                params: {
                    query: {
                        page: 1,
                        pageSize: 100,
                    },
                },
                headers: serverHeaders,
            }
        );

        if (firstError || !firstPageData) {
            console.error(
                "Failed to fetch first page for sitemap:",
                firstError
            );
            return [];
        }

        const totalPages = firstPageData.data.totalPages;

        allUrls.push(
            ...firstPageData.data.items.map((manga) =>
                mangaToSitemapEntry(manga)
            )
        );

        for (let page = 2; page <= totalPages; page++) {
            const { data, error } = await client.GET("/v2/manga/list", {
                params: {
                    query: {
                        page,
                        pageSize: 100,
                    },
                },
                headers: serverHeaders,
            });

            if (error || !data) {
                console.error(
                    `Failed to fetch page ${page} for sitemap:`,
                    error
                );
                continue;
            }

            allUrls.push(
                ...data.data.items.map((manga) => mangaToSitemapEntry(manga))
            );
        }

        return allUrls;
    } catch (error) {
        return [];
    }
}

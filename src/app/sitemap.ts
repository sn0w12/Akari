import { parseStringPromise } from "xml2js";
import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

const NEXT_MANGA_URL = process.env.NEXT_MANGA_URL!;
const NEXT_HOST = process.env.NEXT_HOST!;

interface SitemapEntry {
    url: string;
    lastModified?: Date;
}

interface RawUrlEntry {
    loc: [string];
    lastmod?: [string];
}

interface RawUrlSet {
    url: RawUrlEntry[];
}

function normalizeUrl(url: string): string {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
}

async function fetchWithTimeout(
    url: string,
    timeoutMs: number = 10000,
): Promise<Response | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Fetch error for ${url}:`, error);
        return null;
    }
}

export async function generateSitemaps(): Promise<{ id: number }[]> {
    try {
        const baseUrl = normalizeUrl(NEXT_MANGA_URL);
        const response = await fetchWithTimeout(`${baseUrl}/sitemap.xml`);
        if (!response) {
            console.error(
                "Failed to fetch sitemap index: fetch timed out or failed",
            );
            return [];
        }
        if (!response.ok) {
            throw new Error(
                `Failed to fetch sitemap index: ${response.status}`,
            );
        }
        const xml = await response.text();
        const parsed = await parseStringPromise(xml);
        const sitemaps = parsed.sitemapindex.sitemap;
        // Generate IDs based on the number of sitemaps in the index
        return sitemaps.map((_: unknown, index: number) => ({ id: index }));
    } catch (error) {
        console.error("Error generating sitemaps:", error);
        return []; // Fallback to empty if fetch fails
    }
}

export default async function sitemap({
    id,
}: {
    id: number;
}): Promise<MetadataRoute.Sitemap> {
    try {
        const baseUrl = normalizeUrl(NEXT_MANGA_URL);
        const response = await fetchWithTimeout(`${baseUrl}/sitemap${id}.xml`);
        if (!response) {
            console.error(
                `Failed to fetch sitemap${id}.xml: fetch timed out or failed`,
            );
            return [];
        }
        if (!response.ok) {
            throw new Error(
                `Failed to fetch sitemap${id}.xml: ${response.status}`,
            );
        }
        const xml = await response.text();
        const parsed = await parseStringPromise(xml);

        const rawUrlSet: RawUrlSet = parsed.urlset as RawUrlSet;

        const urls: SitemapEntry[] = rawUrlSet.url.map(
            (u: RawUrlEntry): SitemapEntry => ({
                url: u.loc[0].replace(baseUrl, `https://${NEXT_HOST}`),
                lastModified: u.lastmod ? new Date(u.lastmod[0]) : undefined,
            }),
        );
        return urls;
    } catch (error) {
        console.error(`Error generating sitemap for id ${id}:`, error);
        return []; // Fallback to empty if fetch fails
    }
}

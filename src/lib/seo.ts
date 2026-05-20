import {
    buildImageUrlWithQuality,
    buildSizes,
    buildSrcSet,
    type SizesConfig,
} from "@/components/image";
import { inDevelopment, inPreview } from "@/config";
import { env } from "@/lib/env";

export function robots() {
    if (inDevelopment || inPreview) {
        return {
            index: false,
            follow: false,
        };
    } else {
        return {
            index: true,
            follow: true,
        };
    }
}

interface PaginationInfo {
    totalItems: number;
    currentPage: number;
    pageSize: number;
    readonly totalPages: number;
}

export function getNextPage(
    prefix: string,
    pagination: PaginationInfo | undefined,
): string | undefined {
    if (!pagination) return undefined;
    const hasNextPage = pagination.currentPage < pagination.totalPages;
    return hasNextPage ? `/${prefix}/${pagination.currentPage + 1}` : undefined;
}

export function getPreviousPage(
    prefix: string,
    pagination: PaginationInfo | undefined,
): string | undefined {
    if (!pagination) return undefined;
    const hasPreviousPage = pagination.currentPage > 1;
    return hasPreviousPage
        ? `/${prefix}/${pagination.currentPage - 1}`
        : undefined;
}

export function createOgImage(type: "manga" | "author" | "genre", id: string) {
    return `https://img.akarimanga.dpdns.org/og/${type}/${id}.webp`;
}
type SchemaObject<T> = Extract<T, Record<"@type", string>>;
type JsonLd<T> = { "@context": "https://schema.org" } & SchemaObject<T>;
type SchemaInput<T> =
    SchemaObject<T> extends infer U
        ? U extends Record<"@type", string>
            ? Partial<Omit<U, "@type" | "url">> & {
                  "@type": U["@type"];
                  url: string;
              }
            : never
        : never;
type BaseSchemaInput = { "@type": string; url: string } & Record<
    string,
    unknown
>;

export function createJsonLd<T>(input: SchemaInput<T>): JsonLd<T> {
    const { url, ...rest } = input as BaseSchemaInput;
    const pageUrl = `https://${env("VITE_HOST")}/${url.startsWith("/") ? url.slice(1) : url}`;

    return {
        "@context": "https://schema.org",
        ...rest,
        "@id": pageUrl,
        url: pageUrl,
    } as unknown as JsonLd<T>;
}

type OpenGraphType =
    | "website"
    | "article"
    | "book"
    | "profile"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";

export interface HeadData {
    meta: Record<string, string>[];
    links?: Record<string, string>[];
}

interface ImagePreloadOptions {
    src: string;
    sizes: SizesConfig;
    quality?: number;
}

interface MetadataOptions {
    title: string;
    description: string;
    canonicalPath: string;
    image?: string;
    siteName?: string;
    type?: OpenGraphType;
    pagination?: {
        previous?: string;
        next?: string;
    };
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    const words = text.trim().split(" ");
    let truncated = "";
    for (const word of words) {
        if ((truncated + word).length > maxLength) break;
        truncated += `${word} `;
    }
    return truncated.trim() + "…";
}

export function createMetadata(options: MetadataOptions): HeadData {
    const title = `${options.title} - Akari`;
    const description = `Akari Manga - ${truncate(options.description, 145)}`;
    const canonicalPath = options.canonicalPath?.startsWith("/")
        ? options.canonicalPath.slice(1)
        : options.canonicalPath;
    let image = options.image;
    if (env("VITE_HOST") && image && !image.startsWith("http")) {
        image = `https://${env("VITE_HOST")}/${
            image.startsWith("/") ? image.slice(1) : image
        }`;
    }

    const meta: Record<string, string>[] = [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: options.title },
        { property: "og:description", content: description },
        { property: "og:type", content: options.type ?? "website" },
        {
            property: "og:site_name",
            content: options.siteName ?? "Akari Manga",
        },
        {
            property: "og:url",
            content: `https://${env("VITE_HOST")}/${canonicalPath}`,
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: options.title },
        { name: "twitter:description", content: description },
    ];

    if (image) {
        meta.push({ property: "og:image", content: image });
        meta.push({ name: "twitter:image", content: image });
    }

    if (options.pagination?.previous) {
        meta.push({
            property: "og:see_also",
            content: `https://${env("VITE_HOST")}${options.pagination.previous}`,
        });
    }
    if (options.pagination?.next) {
        meta.push({
            property: "og:see_also",
            content: `https://${env("VITE_HOST")}${options.pagination.next}`,
        });
    }

    const links: Record<string, string>[] = [
        {
            rel: "canonical",
            href: `https://${env("VITE_HOST")}/${canonicalPath}`,
        },
    ];

    if (options.pagination?.previous) {
        links.push({
            rel: "prev",
            href: `https://${env("VITE_HOST")}${options.pagination.previous}`,
        });
    }
    if (options.pagination?.next) {
        links.push({
            rel: "next",
            href: `https://${env("VITE_HOST")}${options.pagination.next}`,
        });
    }

    const robotsVal = robots();
    if (!robotsVal.index) {
        meta.push({
            name: "robots",
            content: robotsVal.index === false ? "noindex" : "index",
        });
    }
    if (!robotsVal.follow) {
        const current = meta.find((m) => m.name === "robots");
        if (current) {
            current.content = `${current.content}, nofollow`;
        } else {
            meta.push({ name: "robots", content: "nofollow" });
        }
    }

    return { meta, links };
}

export function createImagePreloadLink({
    src,
    sizes,
    quality,
}: ImagePreloadOptions): Record<string, string> {
    return {
        rel: "preload",
        as: "image",
        fetchpriority: "high",
        href: buildImageUrlWithQuality(src, quality),
        imagesrcset: buildSrcSet(src, quality),
        imagesizes: buildSizes(sizes),
    };
}

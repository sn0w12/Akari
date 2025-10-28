import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CookieCategory, useCookieConsent } from "@/hooks/use-cookie-consent";
import { inDevelopment, inPreview } from "@/config";
import { Metadata } from "next";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const setCookie = (
    name: string,
    value: string,
    category: CookieCategory,
    maxAge = 31536000
) => {
    const { consent } = useCookieConsent.getState();

    if (!consent[category]) {
        return false;
    }

    document.cookie = `${name}=${value};path=/;max-age=${maxAge}`;
    return true;
};

export function imageUrl(url: string, baseUrl?: string): string {
    if (url.includes("myanimelist")) {
        return url;
    }

    return `${baseUrl || ""}/api/v1/image-proxy?imageUrl=${encodeURIComponent(
        url
    )}`;
}

export function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
        if (diffMinutes === 1) {
            return `1 minute ago`;
        }
        return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        if (diffHours === 1) {
            return `1 hour ago`;
        }
        return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
        if (diffDays === 1) {
            return `1 day ago`;
        }
        return `${diffDays} days ago`;
    } else {
        const options: Intl.DateTimeFormatOptions = {
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        return date.toLocaleDateString("en-US", options);
    }
}

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

interface MetadataOptions {
    title: string;
    description: string;
    canonicalPath: string;
    image?: string;
    siteName?: string;
    type?: OpenGraphType;
}

export function createMetadata(options: MetadataOptions): Metadata {
    const title = `${options.title} - Akari`;
    const description = `Akari Manga - ${options.description}`;
    const canonicalPath = options.canonicalPath?.startsWith("/")
        ? options.canonicalPath.slice(1)
        : options.canonicalPath;
    let image = options.image;
    if (process.env.NEXT_PUBLIC_HOST && image) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/${
            image.startsWith("/") ? image.slice(1) : image
        }`;
    }

    return {
        title: title,
        description: description,
        robots: robots(),
        alternates: {
            canonical: `https://${process.env.NEXT_PUBLIC_HOST}/${canonicalPath}`,
        },
        openGraph: {
            title: options.title,
            description: description,
            type: options.type ?? "website",
            siteName: options.siteName ?? "Akari Manga",
            images: image,
        },
        twitter: {
            card: "summary_large_image",
            title: options.title,
            description: description,
            images: image,
        },
    };
}

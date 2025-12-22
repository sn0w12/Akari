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

export function getInitials(displayName: string) {
    return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
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

export function createOgImage(type: "manga" | "author" | "genre", id: string) {
    return `https://img.akarimanga.dpdns.org/og/${type}/${id}.webp`;
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
        appleWebApp: {
            title: "Akari",
            statusBarStyle: "black",
            startupImage: [
                {
                    url: "/pwa/apple-splash-2048-2732.jpg",
                    media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2732-2048.jpg",
                    media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1668-2388.jpg",
                    media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2388-1668.jpg",
                    media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1536-2048.jpg",
                    media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2048-1536.jpg",
                    media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1640-2360.jpg",
                    media: "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2360-1640.jpg",
                    media: "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1668-2224.jpg",
                    media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2224-1668.jpg",
                    media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1620-2160.jpg",
                    media: "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2160-1620.jpg",
                    media: "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1488-2266.jpg",
                    media: "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2266-1488.jpg",
                    media: "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1320-2868.jpg",
                    media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2868-1320.jpg",
                    media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1206-2622.jpg",
                    media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2622-1206.jpg",
                    media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1260-2736.jpg",
                    media: "(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2736-1260.jpg",
                    media: "(device-width: 420px) and (device-height: 912px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1290-2796.jpg",
                    media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2796-1290.jpg",
                    media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1179-2556.jpg",
                    media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2556-1179.jpg",
                    media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1170-2532.jpg",
                    media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2532-1170.jpg",
                    media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1284-2778.jpg",
                    media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2778-1284.jpg",
                    media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1125-2436.jpg",
                    media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2436-1125.jpg",
                    media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1242-2688.jpg",
                    media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2688-1242.jpg",
                    media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-828-1792.jpg",
                    media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-1792-828.jpg",
                    media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-1242-2208.jpg",
                    media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-2208-1242.jpg",
                    media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-750-1334.jpg",
                    media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-1334-750.jpg",
                    media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
                {
                    url: "/pwa/apple-splash-640-1136.jpg",
                    media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
                },
                {
                    url: "/pwa/apple-splash-1136-640.jpg",
                    media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
                },
            ],
        },
    };
}

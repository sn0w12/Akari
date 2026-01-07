import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CookieCategory, useCookieConsent } from "@/hooks/use-cookie-consent";
import { inDevelopment, inPreview } from "@/config";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const setCookie = (
    name: string,
    value: string,
    category: CookieCategory,
    maxAge = 31536000,
) => {
    const { consent } = useCookieConsent.getState();

    if (!consent[category]) {
        return false;
    }

    document.cookie = `${name}=${value};path=/;max-age=${maxAge}`;
    return true;
};

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

export function generateSizes(options: {
    default?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
}): string {
    const breakpoints = [
        { key: "sm", min: 640 },
        { key: "md", min: 768 },
        { key: "lg", min: 1024 },
        { key: "xl", min: 1280 },
        { key: "2xl", min: 1536 },
    ];

    const sizes: string[] = [];

    // Add min-width conditions from largest to smallest (most restrictive first)
    for (const bp of breakpoints.slice().reverse()) {
        const size = options[bp.key as keyof typeof options];
        if (size && bp.key !== "sm") {
            // Skip 'sm' since it's the fallback
            sizes.push(`(min-width: ${bp.min}px) ${size}`);
        }
    }

    // Add the fallback size for smallest screens
    let fallback = "100vw";
    if (options.default !== undefined) {
        fallback = options.default;
    } else {
        // Find the smallest breakpoint that has a value
        for (const bp of breakpoints) {
            const size = options[bp.key as keyof typeof options];
            if (size) {
                fallback = size;
                break;
            }
        }
    }
    sizes.push(fallback);

    return sizes.join(", ");
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

export function createOgImage(type: "manga" | "author" | "genre", id: string) {
    return `https://img.akarimanga.dpdns.org/og/${type}/${id}.webp`;
}

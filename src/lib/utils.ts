import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CookieCategory, useCookieConsent } from "@/hooks/use-cookie-consent";
import { inDevelopment, inPreview } from "@/config";

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
        return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
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

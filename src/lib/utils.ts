import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(word: string, count: number) {
    return count === 1 ? word : `${word}s`;
}

/**
 * Converts a number to a readable string with suffixes (K, M, B).
 * Examples: 1200 -> "1.2K", 1500000 -> "1.5M"
 */
export function formatNumberShort(
    num: number,
    decimalPlaces: number = 1,
): string {
    if (num < 1000) return num.toString();
    const units = [
        { value: 1e9, symbol: "B" },
        { value: 1e6, symbol: "M" },
        { value: 1e3, symbol: "K" },
    ];
    for (const unit of units) {
        if (num >= unit.value) {
            const formatted = (num / unit.value).toFixed(decimalPlaces);
            // Remove trailing .0 if present
            return `${parseFloat(formatted)}${unit.symbol}`;
        }
    }
    return num.toString();
}

export type CookieConsent = {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
};

export type CookieCategory = keyof CookieConsent;

export const setCookie = (
    name: string,
    value: string,
    category: CookieCategory,
    maxAge = 31536000,
) => {
    if (typeof window === "undefined") return false;
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

const imageSizes = [48, 96, 128, 240, 320, 400, 640, 1080, 1920] as const;
export type SizesValue = `${number}vw` | `${(typeof imageSizes)[number]}px`;

export function generateSizes(options: {
    default?: SizesValue;
    sm?: SizesValue;
    md?: SizesValue;
    lg?: SizesValue;
    xl?: SizesValue;
    "2xl"?: SizesValue;
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
        if (size) {
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

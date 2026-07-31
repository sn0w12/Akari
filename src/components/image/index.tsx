import { cn } from "@/lib/utils";
import {
    forwardRef,
    useMemo,
    useState,
    type ImgHTMLAttributes,
    type MouseEvent,
} from "react";
import { thumbHashToDataURL } from "thumbhash";
import { Button } from "../ui/button";
import { RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export interface SizesConfig {
    default?: string;
    sm?: ImageWidths;
    md?: ImageWidths;
    lg?: ImageWidths;
    xl?: ImageWidths;
    "2xl"?: ImageWidths;
}

const DEFAULT_WIDTHS = [48, 96, 128, 240, 320, 400, 640, 1080, 1920] as const;
export type ImageWidths = (typeof DEFAULT_WIDTHS)[number];

const breakpoints: { key: keyof SizesConfig; min: number }[] = [
    { key: "sm", min: 640 },
    { key: "md", min: 768 },
    { key: "lg", min: 1024 },
    { key: "xl", min: 1280 },
    { key: "2xl", min: 1536 },
];

function buildImageUrl(
    src: string,
    width: number,
    quality = 80,
    query: Record<string, string | number | boolean | undefined> = {},
) {
    const url = new URL(src);
    url.searchParams.append("width", width.toString());
    url.searchParams.append("quality", quality.toString());

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined) return;
        url.searchParams.append(key, String(value));
    });

    return url.toString();
}

export function buildSrcSet(
    src: string,
    quality?: number,
    query: Record<string, string | number | boolean | undefined> = {},
) {
    return DEFAULT_WIDTHS.map(
        (width) => `${buildImageUrl(src, width, quality, query)} ${width}w`,
    ).join(", ");
}

export function buildSizes(sizes: SizesConfig) {
    const suppliedBreakpoints = breakpoints.filter((bp) => sizes[bp.key]);

    const responsiveSizes = breakpoints
        .slice()
        .reverse()
        .flatMap((bp) => {
            const size = sizes[bp.key];
            if (!size) return [];
            return [`(min-width: ${bp.min}px) ${size}px`];
        });

    const smallestBreakpoint = suppliedBreakpoints[0];
    const fallbackSize = smallestBreakpoint
        ? `${sizes[smallestBreakpoint.key]}px`
        : (sizes.default ?? "100vw");

    return [...responsiveSizes, fallbackSize].join(", ");
}

export function buildImageUrlWithQuality(
    src: string,
    quality?: number,
): string {
    return buildImageUrl(src, 1920, quality);
}

export interface ImageProps extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "sizes"
> {
    src: string;
    sizes?: SizesConfig;
    quality?: number;
    unOptimized?: boolean;
    thumbHash?: string | null;
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
    { src, alt, className, quality, sizes, unOptimized, thumbHash, ...props },
    ref,
) {
    const [loaded, setLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const placeholderSrc = useMemo(() => {
        if (!thumbHash) return null;
        try {
            const hashData =
                typeof thumbHash === "string"
                    ? Uint8Array.from(atob(thumbHash), (c) => c.charCodeAt(0))
                    : thumbHash;
            return thumbHashToDataURL(hashData);
        } catch {
            return null;
        }
    }, [thumbHash]);

    const handleRetry = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        setHasError(false);
        setLoaded(false);
        setReloadKey((prev) => prev + 1);
    };

    if (!sizes && !unOptimized) {
        console.warn(
            "Image component: No sizes provided, defaulting to 100vw. This may lead to suboptimal image loading on different screen sizes. Consider providing a sizes prop for better performance.",
        );
    }

    // If we have no thumbhash, instruct proxy to generate and insert
    const query = thumbHash ? undefined : { gen: 1 };
    const finalSrc = buildImageUrl(src, 1920, quality, query);
    const srcSet = buildSrcSet(src, quality, query);
    const sizeAttr = buildSizes(sizes ?? { default: "100vw" });

    return (
        <>
            {unOptimized ? (
                <>
                    {!hasError ? (
                        <img
                            ref={ref}
                            key={reloadKey}
                            src={src}
                            alt={alt}
                            className={className}
                            onLoad={() => setLoaded(true)}
                            onError={() => setHasError(true)}
                            {...props}
                        />
                    ) : (
                        <ReloadCard
                            handleReload={handleRetry}
                            className={className}
                        />
                    )}
                </>
            ) : (
                <div
                    className={cn(
                        "relative overflow-hidden",
                        hasError && "h-full w-full",
                    )}
                >
                    {/* Placeholder image (hidden when main image is loaded) */}
                    {placeholderSrc && (
                        <img
                            src={placeholderSrc}
                            alt=""
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover transition-opacity ease-snappy pointer-events-none opacity-100",
                                loaded && "opacity-0",
                                className,
                            )}
                        />
                    )}
                    {/* Main image */}
                    {!hasError ? (
                        <img
                            ref={ref}
                            key={reloadKey}
                            src={finalSrc}
                            srcSet={srcSet}
                            sizes={sizeAttr}
                            alt={alt}
                            className={cn(
                                "block w-full h-auto transition-opacity ease-snappy opacity-0",
                                loaded && "opacity-100",
                                className,
                            )}
                            onLoad={() => setLoaded(true)}
                            onError={() => setHasError(true)}
                            {...props}
                        />
                    ) : (
                        <ReloadCard
                            handleReload={handleRetry}
                            className={cn("block w-full h-auto", className)}
                        />
                    )}
                </div>
            )}
        </>
    );
});

function ReloadCard({
    handleReload,
    className,
}: {
    handleReload: (e: MouseEvent<HTMLButtonElement>) => void;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "w-full h-full",
                className,
                "flex justify-center items-center",
            )}
        >
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button size="icon-lg" onClick={handleReload}>
                            <RotateCcw />
                        </Button>
                    }
                />
                <TooltipContent>Reload Image</TooltipContent>
            </Tooltip>
        </div>
    );
}

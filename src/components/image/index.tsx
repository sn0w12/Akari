import { forwardRef, type ImgHTMLAttributes } from "react";

export interface SizesConfig {
    default?: string;
    sm?: ImageWidths;
    md?: ImageWidths;
    lg?: ImageWidths;
    xl?: ImageWidths;
    "2xl"?: ImageWidths;
}

export interface ImageProps extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "srcSet" | "sizes"
> {
    src: string;
    sizes?: SizesConfig;
    quality?: number;
    unOptimized?: boolean;
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

function buildImageUrl(src: string, width: number, quality = 80) {
    return `${src}?width=${width}&quality=${quality}`;
}

export function buildSrcSet(src: string, quality?: number) {
    return DEFAULT_WIDTHS.map(
        (width) => `${buildImageUrl(src, width, quality)} ${width}w`,
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

export const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
    { src, alt, className, quality, sizes, unOptimized, ...props },
    ref,
) {
    if (unOptimized) {
        return (
            <img
                ref={ref}
                src={src}
                alt={alt}
                className={className}
                {...props}
            />
        );
    }

    if (!sizes) {
        console.warn(
            "Image component: No sizes provided, defaulting to 100vw. This may lead to suboptimal image loading on different screen sizes. Consider providing a sizes prop for better performance.",
        );
        sizes = { default: "100vw" };
    }

    return (
        <img
            ref={ref}
            src={buildImageUrl(src, 1920, quality)}
            srcSet={buildSrcSet(src, quality)}
            sizes={buildSizes(sizes)}
            alt={alt}
            className={className}
            {...props}
        />
    );
});

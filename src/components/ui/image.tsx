import React, { ImgHTMLAttributes } from "react";

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    sizes?: string;
    priority?: boolean;
    loading?: "lazy" | "eager";
    fetchPriority?: "high" | "low" | "auto";
    preload?: boolean;
    fill?: boolean;
    className?: string;
    onLoad?: () => void;
    onError?: () => void;
}

/**
 * Custom Image component that replaces next/image
 * Generates URLs with width and quality parameters similar to the custom image loader
 */
export default function Image({
    src,
    alt,
    width,
    height,
    quality = 80,
    sizes,
    priority = false,
    loading = "lazy",
    fetchPriority = "auto",
    preload = false,
    fill = false,
    className,
    style,
    onLoad,
    onError,
    ...rest
}: ImageProps) {
    // Image sizes configuration matching Next.js config
    const imageSizes = [48, 96, 128, 240, 320, 400, 640, 1080, 1920];
    const qualities = [20, 40, 60, 80, 100];

    // Generate srcset with different widths and qualities
    const generateSrcSet = () => {
        if (!sizes) return undefined;

        return imageSizes
            .filter((size) => !width || size <= width * 2)
            .map((size) => {
                const url = `${src}?width=${size}&quality=${quality}`;
                return `${url} ${size}w`;
            })
            .join(", ");
    };

    // Generate the main src URL
    const generateSrc = () => {
        const targetWidth = width || 1920;
        return `${src}?width=${targetWidth}&quality=${quality}`;
    };

    // Determine actual loading strategy
    const actualLoading = priority ? "eager" : loading;
    const actualFetchPriority = priority ? "high" : fetchPriority;

    // Handle fill prop (absolute positioning)
    const fillStyles: React.CSSProperties = fill
        ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
          }
        : {};

    const combinedStyle = { ...fillStyles, ...style };

    // If preload is true and we're in a browser, add a preload link
    React.useEffect(() => {
        if (preload && priority && typeof document !== "undefined") {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = generateSrc();
            if (sizes) link.setAttribute("imagesizes", sizes);
            if (generateSrcSet()) link.setAttribute("imagesrcset", generateSrcSet()!);
            document.head.appendChild(link);

            return () => {
                document.head.removeChild(link);
            };
        }
    }, [preload, priority, src, sizes]);

    return (
        <img
            src={generateSrc()}
            srcSet={generateSrcSet()}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={actualLoading}
            fetchpriority={actualFetchPriority}
            className={className}
            style={combinedStyle}
            onLoad={onLoad}
            onError={onError}
            {...rest}
        />
    );
}

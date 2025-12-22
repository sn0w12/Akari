"use client";

export default function ImageLoader({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) {
    return `${src}?width=${width}&q=${quality || 75}`;
}

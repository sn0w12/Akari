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
    return `${src}?width=${width}&quality=${quality || 80}`;
}

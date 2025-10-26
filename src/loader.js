"use client";

export default function imageLoader({ src, width, quality }) {
    return `${src}?width=${width}&quality=${quality || 75}`;
}

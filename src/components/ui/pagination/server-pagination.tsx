"use client";

import { useRouter } from "next/navigation";
import { BasePagination } from "./base-pagination";

interface PaginationElementProps {
    currentPage: number;
    totalPages: number;
    className?: string;
    href?: string;
}

export function ServerPagination({
    currentPage,
    totalPages,
    className,
    href,
}: PaginationElementProps) {
    const router = useRouter();

    const createPageUrl = (page: number) => {
        if (typeof window === "undefined") {
            return href || `?page=${page}`;
        }

        const base = href || "";
        const separator = base.includes("?") ? "&" : "?";

        // Get all current search params except 'page'
        const params = new URLSearchParams();
        const searchParams = new URL(window.location.href).searchParams;
        searchParams.forEach((value, key) => {
            if (key !== "page" && value) {
                params.append(key, value);
            }
        });

        // Add the new page param
        params.set("page", page.toString());

        const paramsString = params.toString();
        return base + separator + paramsString;
    };

    return (
        <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            className={className}
            getPageUrl={createPageUrl}
            onPrefetch={(url) => router.prefetch(url)}
        />
    );
}

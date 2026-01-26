"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
    const searchParams = useSearchParams();

    const createPageUrl = (page: number) => {
        const base = href || "";
        const separator = base.includes("?") ? "&" : "?";

        // Get all current search params except 'page'
        const params = new URLSearchParams();
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

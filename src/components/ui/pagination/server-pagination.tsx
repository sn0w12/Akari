"use client";

import { useRouterState } from "@tanstack/react-router";
import { Suspense } from "react";
import { BasePagination } from "./base-pagination";

interface PaginationElementProps {
    currentPage: number;
    totalPages: number;
    href: string;
    className?: string;
}

export function ServerPagination({
    currentPage,
    totalPages,
    className,
    href,
}: PaginationElementProps) {
    return (
        <Suspense
            fallback={
                <ServerPaginationFallback
                    currentPage={currentPage}
                    totalPages={totalPages}
                    className={className}
                    href={href}
                />
            }
        >
            <ServerPaginationContent
                currentPage={currentPage}
                totalPages={totalPages}
                className={className}
                href={href}
            />
        </Suspense>
    );
}

function ServerPaginationContent({
    currentPage,
    totalPages,
    className,
    href,
}: PaginationElementProps) {
    const searchParams = new URLSearchParams(useRouterState({ select: (s) => s.location.search }));

    const createPageUrl = (page: number) => {
        // Get all current search params except 'page'
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
            if (key !== "page" && value) {
                params.append(key, value);
            }
        });

        const paramsString = params.toString();

        let url = href;
        if (page > 1) {
            url += `/${page}`;
        }
        if (paramsString) {
            url += `?${paramsString}`;
        }

        return url;
    };

    return (
        <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            className={className}
            getPageUrl={createPageUrl}
            onPrefetch={() => {}}
        />
    );
}

function ServerPaginationFallback({
    currentPage,
    totalPages,
    className,
    href,
}: PaginationElementProps) {
    return (
        <BasePagination
            currentPage={currentPage}
            totalPages={totalPages}
            className={className}
            getPageUrl={() => {
                return href;
            }}
            onPrefetch={() => {}}
        />
    );
}

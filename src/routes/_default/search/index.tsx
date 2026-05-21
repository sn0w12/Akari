import SearchPage from "@/components/search";
import SearchPageSkeleton from "@/components/search/skeleton";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createMetadata } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_default/search/")({
    head: () => {
        const { meta, links } = createMetadata({
            title: "Search Manga",
            description: "Search for your favorite manga titles on Akari.",
            canonicalPath: "/search",
        });
        return { meta, links };
    },
    validateSearch: (
        search: Record<string, string | undefined>,
    ): {
        page?: number;
        query?: string;
        genres?: string;
        types?: string;
        excludedGenres?: string;
        excludedTypes?: string;
        sort?: "search" | "latest" | "popular" | "newest";
    } => {
        const page = Number(search.page);
        const query = search.q;
        const genres = search.genres;
        const types = search.types;
        const excludedGenres = search.excludedGenres;
        const excludedTypes = search.excludedTypes;
        const sort = search.sort;

        return {
            ...(Number.isFinite(page) && page > 0 ? { page } : {}),
            ...(query ? { query } : {}),
            ...(genres ? { genres } : {}),
            ...(types ? { types } : {}),
            ...(excludedGenres ? { excludedGenres } : {}),
            ...(excludedTypes ? { excludedTypes } : {}),
            ...(sort && ["search", "latest", "popular", "newest"].includes(sort)
                ? { sort: sort as "search" | "latest" | "popular" | "newest" }
                : {}),
        };
    },
    component: Search,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder().noCache().build(),
    }),
});

function Search() {
    return (
        <div className="flex-1">
            <Suspense fallback={<SearchPageSkeleton />}>
                <SearchPage />
            </Suspense>
        </div>
    );
}

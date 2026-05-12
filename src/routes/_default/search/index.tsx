import { PageWrapper } from "@/components/page-wrapper";
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
    component: Search,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .noCache()
            .build(),
    }),
});

function Search() {
    return (
        <PageWrapper>
            <div className="flex-1">
                <Suspense fallback={<SearchPageSkeleton />}>
                    <SearchPage />
                </Suspense>
            </div>
        </PageWrapper>
    );
}

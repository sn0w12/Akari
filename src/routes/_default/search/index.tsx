import { createFileRoute } from "@tanstack/react-router";
import { PageWrapper } from "@/components/page-wrapper";
import SearchPage from "@/components/search";
import SearchPageSkeleton from "@/components/search/skeleton";
import { createMetadata } from "@/lib/seo";
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

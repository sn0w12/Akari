import { ListComponent } from "@/components/list/list";
import { ListSkeleton } from "@/components/list/list-skeleton";
import { ResponseCacheControlBuilder } from "@/lib/cache";
import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

export const Route = createFileRoute("/_default/lists/$id/")({
    component: ListPage,
    headers: () => ({
        "Cache-Control": new ResponseCacheControlBuilder()
            .maxAge({ minutes: 2 })
            .staleWhileRevalidate({ minutes: 10 })
            .public()
            .build(),
    }),
});

function ListPage() {
    const { id } = Route.useParams();
    return (
        <div className="flex-1">
            <Suspense fallback={<ListSkeleton />}>
                <ListComponent id={id} />
            </Suspense>
        </div>
    );
}

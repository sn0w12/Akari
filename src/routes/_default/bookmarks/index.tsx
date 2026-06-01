import BookmarksHeader from "@/components/bookmarks/bookmarks-header";
import { BookmarkCard } from "@/components/bookmarks/cards/bookmark-card";
import BookmarksSkeleton from "@/components/bookmarks/skeleton";
import ErrorPage from "@/components/error-page";
import { ButtonLink } from "@/components/ui/button-link";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_default/bookmarks/")({
    validateSearch: (
        search: Record<string, string | undefined>,
    ): { page?: number } => {
        const page = Number(search.page);
        return Number.isFinite(page) && page > 0 ? { page } : {};
    },
    component: Bookmarks,
});

function Bookmarks() {
    const { page = 1 } = Route.useSearch();
    const { data, error, isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["bookmarks", page],
        queryFn: async () => {
            const { data: result, error: err } = await client.GET(
                "/v2/bookmarks",
                {
                    params: { query: { page } },
                },
            );
            if (err) throw err;
            return result.data;
        },
        retry: false,
    });

    return (
        <div className="flex-1 p-4">
            <BookmarksHeader
                isRefreshing={isRefetching}
                onRefresh={() => {
                    void refetch();
                }}
            />
            {isLoading ? <BookmarksSkeleton /> : null}
            {error ? <ErrorPage error={error as never} /> : null}
            {data && data.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                    <p className="text-lg text-muted-foreground">
                        No bookmarks yet.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Start reading and bookmark your favorite series!
                    </p>
                    <ButtonLink to="/" className="mt-1.5">
                        Browse Series
                    </ButtonLink>
                </div>
            ) : null}
            {data && data.items.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                        {data.items.map((bookmark) => (
                            <div key={bookmark.bookmarkId}>
                                <BookmarkCard bookmark={bookmark} />
                            </div>
                        ))}
                    </div>
                    <ServerPagination
                        currentPage={page}
                        totalPages={Number(data.totalPages)}
                        className="mt-4 mb-0"
                        href="/bookmarks"
                    />
                </>
            ) : null}
        </div>
    );
}

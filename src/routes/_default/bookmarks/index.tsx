import { createFileRoute } from "@tanstack/react-router";
import BookmarksHeader from "@/components/bookmarks/bookmarks-header";
import { BookmarkCard } from "@/components/bookmarks/cards/bookmark-card";
import BookmarksSkeleton from "@/components/bookmarks/skeleton";
import ErrorPage from "@/components/error-page";
import { PageWrapper } from "@/components/page-wrapper";
import { ButtonLink } from "@/components/ui/button-link";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_default/bookmarks/")({
    component: Bookmarks,
});

function Bookmarks() {
    const { data, error, isLoading } = useQuery({
        queryKey: ["bookmarks", 1],
        queryFn: async () => {
            const { data: result, error: err } = await client.GET("/v2/bookmarks", {
                params: { query: { page: 1 } },
            });
            if (err) throw err;
            return result.data;
        },
        retry: false,
    });

    return (
        <PageWrapper>
            <div className="flex-1 p-4">
                <BookmarksHeader />
                {isLoading ? <BookmarksSkeleton /> : null}
                {error ? <ErrorPage error={error as never} /> : null}
                {data && data.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <p className="text-lg text-muted-foreground">No bookmarks yet.</p>
                        <p className="text-sm text-muted-foreground">Start reading and bookmark your favorite series!</p>
                        <ButtonLink to="/" className="mt-1.5">Browse Series</ButtonLink>
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
                            currentPage={1}
                            totalPages={Number(data.totalPages)}
                            className="mt-4 mb-0"
                            href="/bookmarks"
                        />
                    </>
                ) : null}
            </div>
        </PageWrapper>
    );
}

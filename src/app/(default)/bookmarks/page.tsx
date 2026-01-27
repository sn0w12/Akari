import BookmarksHeader from "@/components/bookmarks/bookmarks-header";
import { BookmarkCard } from "@/components/bookmarks/cards/bookmark-card";
import BookmarksSkeleton from "@/components/bookmarks/skeleton";
import ErrorPage from "@/components/error-page";
import { ButtonLink } from "@/components/ui/button-link";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/server";
import { robots } from "@/lib/utils";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ page?: string }>;
}

export const metadata: Metadata = {
    title: "Bookmarks",
    description: "View and manage your bookmarked series",
    robots: robots(),
};

export default async function Bookmarks(props: PageProps) {
    return (
        <div className="h-full bg-background text-foreground">
            <div className="mx-auto p-4 h-full">
                <BookmarksHeader />
                <Suspense fallback={<BookmarksSkeleton />}>
                    <BookmarksGrid {...props} />
                </Suspense>
            </div>
        </div>
    );
}

async function BookmarksGrid(props: PageProps) {
    const { page } = await props.params;
    const pageNumber = Number(page) || 1;
    const token = await getAuthToken();
    if (!token) {
        redirect("/auth/login");
    }

    const { data, error } = await client.GET("/v2/bookmarks", {
        params: {
            query: {
                page: pageNumber,
            },
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    const bookmarks = data?.data.items;
    if (bookmarks.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-lg text-muted-foreground">
                    No bookmarks yet.
                </p>
                <p className="text-sm text-muted-foreground">
                    Start reading and bookmark your favorite series!
                </p>
                <ButtonLink href="/" className="mt-1.5">
                    Browse Series
                </ButtonLink>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {bookmarks.map((bookmark) => (
                    <div key={bookmark.bookmarkId}>
                        <BookmarkCard bookmark={bookmark} />
                    </div>
                ))}
            </div>
            <ServerPagination
                currentPage={pageNumber}
                totalPages={Number(data.data.totalPages)}
                className="mt-4 mb-0"
                href="/bookmarks"
            />
        </>
    );
}

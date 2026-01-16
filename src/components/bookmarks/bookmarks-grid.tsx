import { BookmarksProps } from "@/app/(default)/bookmarks/page";
import { client } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/server";
import { redirect } from "next/navigation";
import ErrorPage from "../error-page";
import { ButtonLink } from "../ui/button-link";
import { ServerPagination } from "../ui/pagination/server-pagination";
import { BookmarkCard } from "./cards/bookmark-card";

export default async function BookmarksGrid(props: BookmarksProps) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const token = await getAuthToken();
    if (!token) {
        redirect("/auth/login");
    }

    const { data, error } = await client.GET("/v2/bookmarks", {
        params: {
            query: {
                page: page,
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
        <section>
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                {bookmarks.map((bookmark) => (
                    <div key={bookmark.bookmarkId}>
                        <BookmarkCard bookmark={bookmark} />
                    </div>
                ))}
            </div>
            <ServerPagination
                currentPage={page}
                totalPages={Number(data.data.totalPages)}
                className="mt-4 mb-0"
            />
        </section>
    );
}

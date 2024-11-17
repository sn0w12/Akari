import BookmarksPage from "@/components/Bookmarks";
import { Suspense } from "react";
import BookmarksSkeleton from "@/components/ui/Bookmarks/bookmarksSkeleton";

interface BookmarksProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Bookmarks(props: BookmarksProps) {
    const searchParams = await props.searchParams;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<BookmarksSkeleton />}>
                <BookmarksPage page={Number(searchParams.page) || 1} />
            </Suspense>
        </div>
    );
}

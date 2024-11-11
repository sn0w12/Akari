import { headers } from "next/headers";
import { getProductionUrl } from "@/app/api/baseUrl";
import BookmarksBody from "./ui/Bookmarks/BookmarksBody";

interface BookmarksPageProps {
    page: number;
}

async function fetchBookmarks(page: number) {
    try {
        const response = await fetch(
            `${getProductionUrl()}/api/bookmarks?page=${page}`,
            {
                headers: await headers(),
            },
        );
        if (!response.ok) {
            throw new Error("Failed to fetch bookmarks.");
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.log(err);
    }
}

export default async function BookmarksPage({ page }: BookmarksPageProps) {
    const data = await fetchBookmarks(page);
    const bookmarks = data?.bookmarks || [];
    const totalPages = data?.totalPages || 1;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 pt-6 pb-8">
                <BookmarksBody
                    bookmarks={bookmarks}
                    page={page}
                    totalPages={totalPages}
                />
            </main>
        </div>
    );
}

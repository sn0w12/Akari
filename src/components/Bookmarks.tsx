import { headers } from "next/headers";
import { getProductionUrl } from "@/app/api/baseUrl";
import BookmarksBody from "./ui/Bookmarks/BookmarksBody";

interface BookmarksPageProps {
    page: number;
}

async function fetchBookmarks(page: number) {
    try {
        // Get headers safely
        let headersList: { [key: string]: string } = {};
        try {
            const headerEntries = Array.from((await headers()).entries());
            headersList = headerEntries.reduce(
                (acc: { [key: string]: string }, [key, value]) => {
                    acc[key] = value;
                    return acc;
                },
                {} as { [key: string]: string },
            );
        } catch (headerError) {
            console.log("Could not get headers:", headerError);
        }

        const response = await fetch(
            `${getProductionUrl()}/api/bookmarks?page=${page}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    ...headersList,
                },
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

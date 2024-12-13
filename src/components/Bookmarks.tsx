import { cookies } from "next/headers";
import { getProductionUrl } from "@/app/api/baseUrl";
import BookmarksBody from "./ui/Bookmarks/BookmarksBody";

interface BookmarksPageProps {
    page: number;
}

async function fetchBookmarks(page: number) {
    try {
        const cookieStore = await cookies();

        const response = await fetch(
            `${getProductionUrl()}/api/bookmarks?page=${page}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: cookieStore
                        .getAll()
                        .map((cookie) => `${cookie.name}=${cookie.value}`)
                        .join("; "),
                },
                signal: AbortSignal.timeout(10000),
            },
        );

        const responseText = await response.text();
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            console.error("Could not parse JSON:", jsonError);
            return {
                bookmarks: [],
                error: "Invalid JSON response",
                totalPages: 1,
            };
        }

        if (data.message) {
            return {
                bookmarks: [],
                error: data.message,
                totalPages: 1,
            };
        }

        return data;
    } catch (err) {
        console.error("Error fetching bookmarks:", err);
        return {
            bookmarks: [],
            totalPages: 1,
        };
    }
}

export default async function BookmarksPage({ page }: BookmarksPageProps) {
    const data = await fetchBookmarks(page);
    const bookmarks = data?.bookmarks || [];
    const totalPages = data?.totalPages || 1;
    const error = data?.error || "";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 pt-6 pb-8">
                <BookmarksBody
                    bookmarks={bookmarks}
                    page={page}
                    totalPages={totalPages}
                    error={error}
                />
            </main>
        </div>
    );
}

import { NextResponse } from "next/server";
import { Bookmark } from "@/app/api/interfaces";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { getBaseUrl } from "../../baseUrl";

export const maxDuration = 20;
const BATCH_SIZE = 10;

export async function GET() {
    console.time("total-execution");
    const cookieStore = cookies();
    const user_data = getUserData(cookieStore);

    if (!user_data) {
        console.timeEnd("total-execution");
        return NextResponse.json(
            { message: "user_data is required" },
            { status: 400 },
        );
    }

    try {
        console.time("cookie-processing");
        const cookieHeader = cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");
        console.timeEnd("cookie-processing");

        // First fetch to get total pages
        console.time("first-page-fetch");
        const firstPageResult = await fetch(
            `${getBaseUrl()}/api/bookmarks?page=1`,
            {
                headers: { Cookie: cookieHeader },
            },
        );

        if (!firstPageResult.ok) {
            console.timeEnd("first-page-fetch");
            console.timeEnd("total-execution");
            return NextResponse.json(
                { message: "Error fetching bookmarks" },
                { status: 500 },
            );
        }

        const firstPageData = await firstPageResult.json();
        const totalPages = firstPageData.totalPages;
        console.log(`Total pages to fetch: ${totalPages}`);
        const allBookmarks: Bookmark[] = [...firstPageData.bookmarks];
        console.timeEnd("first-page-fetch");

        // Create batches of page numbers
        console.time("batch-processing");
        const remainingPages = Array.from(
            { length: totalPages - 1 },
            (_, i) => i + 2,
        );
        const batches = [];

        for (let i = 0; i < remainingPages.length; i += BATCH_SIZE) {
            batches.push(remainingPages.slice(i, i + BATCH_SIZE));
        }

        // Fetch batches in parallel
        for (const batch of batches) {
            console.time(`batch-${batch[0]}-${batch[batch.length - 1]}`);
            const batchPromises = batch.map((page) =>
                fetch(`${getBaseUrl()}/api/bookmarks?page=${page}`, {
                    headers: { Cookie: cookieHeader },
                })
                    .then((res) => res.json())
                    .then((data) => data.bookmarks),
            );

            const batchResults = await Promise.all(batchPromises);
            allBookmarks.push(...batchResults.flat());
            console.timeEnd(`batch-${batch[0]}-${batch[batch.length - 1]}`);
        }
        console.timeEnd("batch-processing");

        console.timeEnd("total-execution");
        return NextResponse.json({ bookmarks: allBookmarks }, { status: 200 });
    } catch (error) {
        console.timeEnd("total-execution");
        return NextResponse.json(
            {
                message: "Error fetching bookmarks",
                error: (error as Error).message,
            },
            { status: 500 },
        );
    }
}

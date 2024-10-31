import { NextResponse } from "next/server";
import { Bookmark } from "@/app/api/interfaces";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";
import { getBaseUrl } from "../../baseUrl";

export async function GET() {
    const cookieStore = cookies();
    const user_data = getUserData(cookieStore);

    if (!user_data) {
        return NextResponse.json(
            { message: "user_data is required" },
            { status: 400 },
        );
    }

    try {
        const cookieHeader = cookieStore
            .getAll()
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");
        let currentPage = 1;
        const allBookmarks: Bookmark[] = [];

        while (true) {
            const result = await fetch(
                `${getBaseUrl()}/api/bookmarks?page=${currentPage}`,
                {
                    headers: {
                        Cookie: cookieHeader,
                    },
                },
            );

            if (!result.ok) {
                return NextResponse.json(
                    {
                        message: "Error fetching bookmarks",
                    },
                    { status: 500 },
                );
            }

            const jsonResult = await result.json();
            const bookmarks = jsonResult.bookmarks;
            allBookmarks.push(...bookmarks);

            const finalPage = jsonResult.totalPages;

            if (currentPage >= finalPage) {
                break;
            }

            currentPage++;
        }

        // Return the fetched data and current page information
        return NextResponse.json(
            {
                bookmarks: allBookmarks,
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: "Error fetching bookmarks",
                error: (error as Error).message,
            },
            { status: 500 },
        );
    }
}

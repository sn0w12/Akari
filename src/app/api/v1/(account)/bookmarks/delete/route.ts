import { cookies } from "next/headers";
import {
    createApiResponse,
    createApiErrorResponse,
    getUsernameFromCookies,
} from "@/lib/api";

export async function DELETE(request: Request): Promise<Response> {
    try {
        const { id }: { id: string } = await request.json();
        const cookieStore = await cookies();

        const username = getUsernameFromCookies(cookieStore);
        if (!username) {
            return createApiErrorResponse(
                { message: "User not logged in" },
                { status: 401 }
            );
        }

        const addBookmark = await fetch(
            `https://${process.env.NEXT_MANGA_URL}/action/bookmark/${id}?action=remove`,
            {
                headers: {
                    cookie: cookieStore.toString(),
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                    referer: `https://${process.env.NEXT_MANGA_URL}/manga/${id}`,
                    host: `${process.env.NEXT_MANGA_URL}`,
                },
            }
        );
        const data = await addBookmark.json();
        return createApiResponse({ success: data.success });
    } catch (error) {
        return createApiErrorResponse(
            { message: (error as Error).message },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";

const BOOKMARK_UPDATE_URL = "https://user.mngusr.com/bookmark_update";

interface BookmarkUpdateRequest {
    user_data: string;
    story_data: string;
    chapter_data: string;
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { story_data, chapter_data }: BookmarkUpdateRequest =
            await request.json();
        const cookieStore = await cookies();
        const user_data = getUserData(cookieStore);

        if (!user_data) {
            return NextResponse.json(
                { result: "error", data: "User data is required" },
                { status: 401 },
            );
        }

        if (!story_data || !chapter_data) {
            return NextResponse.json(
                {
                    result: "error",
                    data: "Missing story_data, or chapter_data",
                },
                { status: 400 },
            );
        }

        const formData = new URLSearchParams();
        formData.append("user_data", user_data);
        formData.append("story_data", story_data);
        formData.append("chapter_data", chapter_data);

        const response = await fetch(BOOKMARK_UPDATE_URL, {
            method: "POST",
            body: formData.toString(),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const data = await response.text();
        const result = JSON.parse(data);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error in /api/bookmarks/update:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}

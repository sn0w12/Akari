import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserData } from "@/lib/mangaNato";

const BOOKMARK_ADD_URL = "https://user.mngusr.com/bookmark_add";

interface BookmarkAddRequest {
    user_data: string;
    story_data: string;
}

export async function POST(request: Request): Promise<Response> {
    try {
        const { story_data }: BookmarkAddRequest = await request.json();
        const cookieStore = cookies();
        const user_data = getUserData(cookieStore);

        if (!user_data || !story_data) {
            return NextResponse.json(
                { result: "error", data: "Missing user_data or story_data" },
                { status: 400 },
            );
        }

        const formData = new URLSearchParams();
        formData.append("user_data", user_data);
        formData.append("story_data", story_data);

        const response = await fetch(BOOKMARK_ADD_URL, {
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
        console.error("Error in /api/bookmarks/add:", error);
        return NextResponse.json(
            { result: "error", data: (error as Error).message },
            { status: 500 },
        );
    }
}

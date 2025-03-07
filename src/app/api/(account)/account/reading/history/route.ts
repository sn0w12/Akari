import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserReadingHistory } from "@/lib/supabase";
import { generateClientCacheHeaders } from "@/lib/cache";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = parseInt(searchParams.get("offset") || "0");

        const history = await getUserReadingHistory(userId, limit, offset);
        return NextResponse.json(
            { history },
            {
                headers: generateClientCacheHeaders(300),
            },
        );
    } catch (error) {
        console.error("Error fetching reading history:", error);
        return NextResponse.json(
            { error: "Failed to fetch reading history" },
            { status: 500 },
        );
    }
}

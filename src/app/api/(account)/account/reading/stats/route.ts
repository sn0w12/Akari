import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getUserReadingStats, userDataToUserId } from "@/lib/supabase";
import { getUserData } from "@/lib/mangaNato";
import { generateClientCacheHeaders } from "@/lib/cache";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const user_data = getUserData(cookieStore);
    const userId = userDataToUserId(user_data);

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const period = searchParams.get("period") as
            | "24h"
            | "7d"
            | "30d"
            | undefined;

        // Get reading statistics from Supabase
        const stats = await getUserReadingStats(userId, period);

        return NextResponse.json(
            { stats },
            {
                headers: generateClientCacheHeaders(300),
            },
        );
    } catch (error) {
        console.error("Error fetching reading statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch reading statistics" },
            { status: 500 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserReadingStats } from "@/lib/supabase";
import { generateClientCacheHeaders } from "@/lib/cache";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

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

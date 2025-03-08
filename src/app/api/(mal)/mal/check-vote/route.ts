import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encodeUserId } from "@/lib/supabase";
import { generateClientCacheHeaders } from "@/lib/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

export async function GET(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 500 },
        );
    }

    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const mangaId = searchParams.get("mangaId");

    if (!mangaId) {
        return NextResponse.json(
            { error: "Missing manga ID parameter" },
            { status: 400 },
        );
    }

    try {
        const encodedUserId = encodeUserId(userId);

        const { data: existingVote } = await supabaseAdmin
            .from("manga_mal_votes")
            .select("id")
            .eq("manga_id", mangaId)
            .eq("user_id", encodedUserId)
            .single();

        return NextResponse.json(
            {
                hasVoted: !!existingVote,
            },
            {
                headers: { ...generateClientCacheHeaders(36000) },
            },
        );
    } catch (error) {
        console.error("Error checking vote status:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

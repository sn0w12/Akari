import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encodeUserId } from "@/lib/supabase";

const REPORT_WEIGHT = -3; // Each report counts as multiple negative votes
const NEGATIVE_THRESHOLD = -1;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

export async function POST(request: NextRequest) {
    if (!supabaseAdmin) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 500 },
        );
    }

    // Get user ID from cookie
    const userId = request.cookies.get("user_id")?.value;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { mangaId } = body;

        if (!mangaId) {
            return NextResponse.json(
                { error: "Missing manga ID" },
                { status: 400 },
            );
        }

        const encodedUserId = encodeUserId(userId);

        // Check if user already voted/reported for this manga
        const { data: existingVote } = await supabaseAdmin
            .from("manga_mal_votes")
            .select("id")
            .eq("manga_id", mangaId)
            .eq("user_id", encodedUserId)
            .single();

        if (existingVote) {
            return NextResponse.json(
                { error: "Already reported" },
                { status: 400 },
            );
        }

        // Get the current MAL data to get the MAL ID
        const { data: malData } = await supabaseAdmin
            .from("manga_mal_data")
            .select("mal_id")
            .eq("id", mangaId)
            .single();

        if (!malData?.mal_id) {
            return NextResponse.json(
                { error: "No MAL data found" },
                { status: 404 },
            );
        }

        // Add negative vote with weight
        await supabaseAdmin.from("manga_mal_votes").insert({
            manga_id: mangaId,
            mal_id: malData.mal_id,
            user_id: encodedUserId,
            weight: REPORT_WEIGHT,
        });

        // Get total weighted votes for this MAL ID
        const { data: votes } = await supabaseAdmin
            .from("manga_mal_votes")
            .select("weight")
            .eq("manga_id", mangaId)
            .eq("mal_id", malData.mal_id);

        if (!votes) {
            return NextResponse.json({ success: true });
        }

        const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);

        // If total weight is below threshold, remove the MAL data
        if (totalWeight <= NEGATIVE_THRESHOLD) {
            await supabaseAdmin
                .from("manga_mal_data")
                .delete()
                .eq("id", mangaId)
                .eq("mal_id", malData.mal_id);

            return NextResponse.json({
                success: true,
                removed: true,
                message: "MAL data removed due to reports",
            });
        }

        return NextResponse.json({
            success: true,
            totalWeight,
            message: "Report recorded",
        });
    } catch (error) {
        console.error("Error processing report:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

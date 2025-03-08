import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encodeUserId } from "@/lib/supabase";

const MIN_TOTAL_VOTES = 3; // Minimum number of total votes required
const REQUIRED_PERCENTAGE = 0.75; // 75% of votes must agree
const TRUSTED_WEIGHT = 5; // Weight multiplier for trusted users
const POPUP_MIN_VOTES = 6;
const POPUP_REQUIRED_PERCENTAGE = 0.8; // 80% agreement to hide popup
const NEGATIVE_THRESHOLD = -5;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

// Parse trusted users from environment variable
const trustedUserIds = process.env.TRUSTED_USER_IDS
    ? process.env.TRUSTED_USER_IDS.split(",").map((id) =>
          encodeUserId(id.trim()),
      )
    : [];

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
        const { mangaId, malId, isPositive } = body;

        if (!mangaId || !malId || isPositive === undefined) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        const encodedUserId = encodeUserId(userId);

        // Check if user already voted for this manga
        const { data: existingVote } = await supabaseAdmin
            .from("manga_mal_votes")
            .select("id")
            .eq("manga_id", mangaId)
            .eq("user_id", encodedUserId)
            .single();

        if (existingVote) {
            return NextResponse.json(
                { error: "Already voted" },
                { status: 400 },
            );
        }

        // Determine vote weight based on trusted status and vote type
        const baseWeight = trustedUserIds.includes(encodedUserId)
            ? TRUSTED_WEIGHT
            : 1;
        const voteWeight = isPositive ? baseWeight : -baseWeight;

        // Add vote with weight
        await supabaseAdmin.from("manga_mal_votes").insert({
            manga_id: mangaId,
            mal_id: malId,
            user_id: encodedUserId,
            weight: voteWeight,
        });

        // Get all votes for this manga with weights
        const { data: allVotes } = await supabaseAdmin
            .from("manga_mal_votes")
            .select("mal_id, weight")
            .eq("manga_id", mangaId);

        if (!allVotes) {
            return NextResponse.json({
                success: true,
                totalVotes: 0,
                totalWeight: 0,
                message: `Need more weighted votes`,
            });
        }

        // Count weighted votes for each MAL ID
        const voteCount: Record<number, number> = {};
        let totalWeightedVotes = 0;

        allVotes.forEach((vote) => {
            voteCount[vote.mal_id] =
                (voteCount[vote.mal_id] || 0) + vote.weight;
            totalWeightedVotes += vote.weight;
        });

        // Check if we need to remove an incorrect MAL data entry
        if (voteCount[malId] <= NEGATIVE_THRESHOLD) {
            // Check if there's an existing entry for this manga+MAL combo
            const { data: existingMalData } = await supabaseAdmin
                .from("manga_mal_data")
                .select("id")
                .eq("id", mangaId)
                .eq("mal_id", malId)
                .single();

            // If an entry exists, remove it
            if (existingMalData) {
                await supabaseAdmin
                    .from("manga_mal_data")
                    .delete()
                    .eq("id", mangaId)
                    .eq("mal_id", malId);

                return NextResponse.json({
                    success: true,
                    removed: true,
                    totalVotes: allVotes.length,
                    totalWeight: totalWeightedVotes,
                    message: `MAL data removed due to negative votes`,
                });
            }
        }

        // Check if we have enough total weight
        if (totalWeightedVotes < MIN_TOTAL_VOTES) {
            return NextResponse.json({
                success: true,
                totalVotes: allVotes.length,
                totalWeight: totalWeightedVotes,
                message: `Need at least ${MIN_TOTAL_VOTES} total weight (current: ${totalWeightedVotes})`,
            });
        }

        // Find the MAL ID with the most weighted votes
        const [winningMalId, winningVotes] = Object.entries(voteCount).reduce(
            (max, [malId, votes]) =>
                votes > max[1] ? [Number(malId), votes] : max,
            [0, 0],
        );

        // Calculate percentage using weighted votes
        const percentage = winningVotes / totalWeightedVotes;

        // Determine if we should hide the popup (more lenient requirements)
        const shouldShowPopup = !(
            totalWeightedVotes >= POPUP_MIN_VOTES &&
            percentage >= POPUP_REQUIRED_PERCENTAGE
        );

        // If we have enough votes and meet the percentage threshold
        if (percentage >= REQUIRED_PERCENTAGE) {
            const jikanResponse = await fetch(
                `https://api.jikan.moe/v4/manga/${winningMalId}`,
            );
            const jikanData = await jikanResponse.json();

            await supabaseAdmin.from("manga_mal_data").upsert({
                id: mangaId,
                mal_id: winningMalId,
                image: jikanData.data.images.webp.large_image_url,
                description: jikanData.data.synopsis,
                score: jikanData.data.score,
                should_show_popup: shouldShowPopup,
                updated_at: new Date().toISOString(),
            });

            return NextResponse.json({
                success: true,
                confirmed: true,
                totalVotes: allVotes.length,
                totalWeight: totalWeightedVotes,
                winningPercentage: percentage,
            });
        }

        return NextResponse.json({
            success: true,
            totalVotes: allVotes.length,
            totalWeight: totalWeightedVotes,
            currentPercentage: percentage,
            message: `Highest vote is at ${Math.round(percentage * 100)}%, need ${Math.round(REQUIRED_PERCENTAGE * 100)}%`,
        });
    } catch (error) {
        console.error("Error processing vote:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

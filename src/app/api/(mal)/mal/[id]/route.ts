import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateCacheHeaders } from "@/lib/cache";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> },
): Promise<Response> {
    const params = await props.params;
    const id = params.id;
    const url = new URL(req.url);
    const includeVotes = url.searchParams.get("includeVotes") === "true";

    if (!supabaseAdmin) {
        return NextResponse.json(
            { error: "Database not configured" },
            { status: 500 },
        );
    }

    if (!id) {
        return NextResponse.json(
            { error: "Missing manga ID" },
            { status: 400 },
        );
    }

    try {
        const { data: mangaData, error } = await supabaseAdmin
            .from("manga_mal_data")
            .select("*")
            .eq("id", id)
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 is "not found" error
            throw error;
        }

        if (!mangaData && includeVotes) {
            // Try to get votes data if official data is not available
            const { data: votesData } = await supabaseAdmin
                .from("manga_mal_votes")
                .select("mal_id, weight")
                .eq("manga_id", id);

            if (votesData && votesData.length > 0) {
                // Count weighted votes for each MAL ID
                const voteCount: Record<string, number> = {};
                let totalWeightedVotes = 0;

                votesData.forEach((vote) => {
                    voteCount[vote.mal_id] =
                        (voteCount[vote.mal_id] || 0) + vote.weight;
                    totalWeightedVotes += vote.weight;
                });

                // Find the MAL ID with the most positive votes
                const entries = Object.entries(voteCount);
                const positiveEntries = entries.filter(
                    ([, votes]) => votes > 0,
                );

                if (positiveEntries.length > 0) {
                    const [topMalId, topVotes] = positiveEntries.reduce(
                        (max, [malId, votes]) =>
                            votes > max[1] ? [malId, votes] : max,
                        ["0", 0],
                    );

                    // Return preliminary data with vote information
                    return NextResponse.json(
                        {
                            success: true,
                            preliminary: true,
                            data: {
                                id: id,
                                mal_id: parseInt(topMalId),
                                positive_votes: topVotes,
                                total_votes: votesData.length,
                                total_weighted_votes: totalWeightedVotes,
                            },
                        },
                        {
                            headers: {
                                ...generateCacheHeaders(3600, 60480, 259200),
                            },
                        },
                    );
                }
            }
        }

        if (!mangaData) {
            return NextResponse.json(
                { error: "Manga not found" },
                {
                    status: 404,
                    headers: {
                        ...generateCacheHeaders(3600, 60480, 259200),
                    },
                },
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: mangaData,
            },
            {
                headers: {
                    ...generateCacheHeaders(36000, 604800, 2592000),
                },
            },
        );
    } catch (error) {
        console.error("Error fetching manga data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

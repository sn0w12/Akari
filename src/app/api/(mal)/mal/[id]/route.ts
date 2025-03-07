import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

        if (error) {
            throw error;
        }

        if (!mangaData) {
            return NextResponse.json(
                { error: "Manga not found" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            data: mangaData,
        });
    } catch (error) {
        console.error("Error fetching manga data:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

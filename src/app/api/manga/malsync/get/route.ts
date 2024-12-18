import { getMangaFromSupabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Missing id parameter" },
            { status: 400 },
        );
    }

    try {
        const data = await getMangaFromSupabase(id);

        if (!data) {
            return NextResponse.json(
                { error: "Failed to save to database" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { success: true, data: data },
            { status: 200 },
        );
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { saveMangaToSupabase } from "@/lib/supabase";
import { z } from "zod";

const mangaSchema = z.object({
    identifier: z.string().min(1),
    mangaData: z.object({
        titles: z.array(
            z.object({
                type: z.string(),
                title: z.string(),
            }),
        ),
        imageUrl: z.string().url(),
        smallImageUrl: z.string().url(),
        url: z.string().url(),
        score: z.number(),
        description: z.string(),
        malUrl: z.string().url().optional(),
        aniUrl: z.string().url().optional(),
    }),
});

export async function POST(request: NextRequest) {
    try {
        // Parse and validate request body
        const body = await request.json();
        const validatedData = mangaSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: "Invalid data", details: validatedData.error },
                { status: 400 },
            );
        }

        const { identifier, mangaData } = validatedData.data;

        // Save to database
        const result = await saveMangaToSupabase(identifier, mangaData);

        if (!result) {
            return NextResponse.json(
                { error: "Failed to save to database" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { success: true, data: result },
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

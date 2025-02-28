import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/app/api/baseUrl";
import { getAccessToken } from "@/lib/accessToken";

export async function GET(req: NextRequest) {
    const accessToken = await getAccessToken(req, getBaseUrl());
    if (!accessToken) {
        return NextResponse.json(
            { error: "Failed to get access token" },
            { status: 401 },
        );
    }

    // Extract query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const sort = searchParams.get("sort") || "list_score";
    const limit = searchParams.get("limit") || "100";
    const offset = searchParams.get("offset") || "0";

    // Build query parameters for MAL API
    const queryParams = new URLSearchParams({
        fields: "list_status",
        sort,
        limit,
        offset,
    });

    // Only add status if it's provided
    if (status) {
        queryParams.append("status", status);
    }

    const response = await fetch(
        `https://api.myanimelist.net/v2/users/@me/mangalist?${queryParams.toString()}`,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    const data = await response.json();
    if (response.ok) {
        return NextResponse.json(data);
    } else {
        return NextResponse.json(
            { error: "Failed to get manga list" },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    const { manga_id, num_chapters_read } = await req.json();
    if (!manga_id || !num_chapters_read) {
        return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }
    const accessToken = await getAccessToken(req, getBaseUrl());
    if (!accessToken) {
        return NextResponse.json(
            { error: "Failed to get access token" },
            { status: 401 },
        );
    }

    const response = await fetch(
        `https://api.myanimelist.net/v2/manga/${manga_id}/my_list_status`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                num_chapters_read,
            }),
        },
    );

    const data = await response.json();
    if (response.ok) {
        return NextResponse.json(data);
    } else {
        return NextResponse.json(
            { error: "Failed to update manga list" },
            { status: 500 },
        );
    }
}

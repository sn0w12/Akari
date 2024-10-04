import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { access_token } = await req.json();

    if (!access_token) {
        return NextResponse.json(
            { error: "Missing access_token" },
            { status: 400 },
        );
    }

    const response = await fetch("https://api.myanimelist.net/v2/users/@me", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const data = await response.json();
    if (response.ok) {
        return NextResponse.json(data);
    } else {
        return NextResponse.json(
            { error: "Failed to get user" },
            { status: 500 },
        );
    }
}

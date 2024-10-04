import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
        return NextResponse.json(
            { error: "Missing refresh token" },
            { status: 400 },
        );
    }

    const tokenResponse = await fetch(
        "https://myanimelist.net/v1/oauth2/token",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_MAL_CLIENT_ID!,
                refresh_token: refresh_token,
                grant_type: "refresh_token",
            }),
        },
    );

    const data = await tokenResponse.json();

    if (tokenResponse.ok) {
        const response = NextResponse.json(data);
        response.cookies.set("access_token", data.access_token, {
            httpOnly: true,
        });
        response.cookies.set("refresh_token", data.refresh_token, {
            httpOnly: true,
        });
        return response;
    } else {
        return NextResponse.json(
            { error: "Failed to refresh token" },
            { status: 500 },
        );
    }
}

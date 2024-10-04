import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "../../baseUrl";

export async function POST(req: NextRequest) {
    const { code, code_verifier } = await req.json();

    if (!code || !code_verifier) {
        return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const response = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.NEXT_PUBLIC_CLIENT_ID!,
            code,
            code_verifier: code_verifier,
            grant_type: "authorization_code",
            redirect_uri: `${getBaseUrl()}/auth/callback`,
        }),
    });

    const data = await response.json();
    const now = new Date();
    const accessExpirationDate = new Date(
        now.getTime() + data.expires_in * 1000,
    );
    const refreshExpirationDate = new Date(
        now.getTime() + 31 * 24 * 60 * 60 * 1000,
    );

    if (response.ok) {
        const response = NextResponse.json(data);
        response.cookies.set("access_token", data.access_token, {
            httpOnly: true,
            expires: accessExpirationDate,
        });
        response.cookies.set("refresh_token", data.refresh_token, {
            httpOnly: true,
            expires: refreshExpirationDate,
        });
        return response;
    } else {
        return NextResponse.json(
            { error: "Failed to get token" },
            { status: 500 },
        );
    }
}

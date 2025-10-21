import { NextRequest } from "next/server";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
        return createApiErrorResponse(
            { message: "Missing refresh token" },
            { status: 400 }
        );
    }

    const tokenResponse = await fetch(
        "https://myanimelist.net/v1/oauth2/token",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.NEXT_PUBLIC_MAL_CLIENT_ID!,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            }),
        }
    );

    const data = await tokenResponse.json();

    if (tokenResponse.ok) {
        const setCookies = [
            `access_token=${data.access_token}; HttpOnly; Path=/`,
            `refresh_token=${data.refresh_token}; HttpOnly; Path=/`,
        ];
        return createApiResponse(data, { setCookies });
    } else {
        return createApiErrorResponse(
            { message: "Failed to refresh token" },
            { status: 500 }
        );
    }
}

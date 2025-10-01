import { NextRequest } from "next/server";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token");

    if (!accessToken || isTokenHalfwayExpired(accessToken)) {
        if (!refreshToken) {
            return createApiErrorResponse(
                { message: "Missing refresh token" },
                { status: 400 }
            );
        }

        const tokenResponse = await fetch("/api/v1/mal/token/refresh");

        if (!tokenResponse.ok) {
            return createApiErrorResponse(
                { message: "Failed to refresh token" },
                { status: 500 }
            );
        }
    }

    return createApiResponse({ accessToken });
}

function isTokenHalfwayExpired(token: string): boolean {
    // Decode the token to get its expiration time
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    const iat = payload.iat;
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if the current time is halfway to the expiration time
    return currentTime >= iat + (exp - iat) / 2;
}

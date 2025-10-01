import { NextRequest } from "next/server";
import { fetchApi, isApiErrorResponse } from "@/lib/api";

export function generateCodeVerifier(length = 128): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let codeVerifier = "";
    for (let i = 0; i < length; i++) {
        codeVerifier += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return codeVerifier;
}

export function generateCodeChallenge(codeVerifier: string): string {
    // MAL requires the plain method, so the challenge is the same as the verifier
    return codeVerifier;
}

export async function getAccessToken(req: NextRequest, baseURL: string) {
    let accessToken = req.cookies.get("access_token")?.value;
    if (!accessToken) {
        const accessTokenResponse = await fetchApi<{
            access_token: string;
            refresh_token: string;
            expires_in: number;
        }>(`${baseURL}/api/v1/mal/token/refresh`);
        if (isApiErrorResponse(accessTokenResponse)) {
            return null;
        }
        accessToken = accessTokenResponse.data.access_token;
    }
    return accessToken;
}

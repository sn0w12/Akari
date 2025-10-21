import { NextRequest } from "next/server";
import { getBaseUrl } from "@/lib/api/base-url";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
    const { code, code_verifier } = await req.json();

    if (!code || !code_verifier) {
        return createApiErrorResponse(
            { message: "Missing input" },
            { status: 400 }
        );
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
        now.getTime() + data.expires_in * 1000
    );
    const refreshExpirationDate = new Date(
        now.getTime() + 31 * 24 * 60 * 60 * 1000
    );

    if (response.ok) {
        const setCookies = [
            `access_token=${
                data.access_token
            }; HttpOnly; Expires=${accessExpirationDate.toUTCString()}; Path=/`,
            `refresh_token=${
                data.refresh_token
            }; HttpOnly; Expires=${refreshExpirationDate.toUTCString()}; Path=/`,
        ];
        return createApiResponse(data, { setCookies });
    } else {
        return createApiErrorResponse(
            { message: data.message },
            { status: response.status }
        );
    }
}

import { NextRequest } from "next/server";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
    const { access_token } = await req.json();

    if (!access_token) {
        return createApiErrorResponse(
            { message: "Missing access_token" },
            { status: 400 }
        );
    }

    const response = await fetch("https://api.myanimelist.net/v2/users/@me", {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    const data = await response.json();
    if (response.ok) {
        return createApiResponse(data);
    } else {
        return createApiErrorResponse(
            { message: "Failed to get user" },
            { status: 500 }
        );
    }
}

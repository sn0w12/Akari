import { NextRequest } from "next/server";
import { getAccessToken } from "@/lib/auth/mal";
import { getProductionUrl } from "@/lib/api/base-url";
import { createApiResponse, createApiErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
    const accessToken = await getAccessToken(req, getProductionUrl());

    if (!accessToken) {
        return createApiErrorResponse(
            { message: "Missing access_token" },
            { status: 401 }
        );
    }

    return createApiResponse(
        { result: "ok" },
        {
            cacheTime: 1800,
        }
    );
}

import { getAccessToken } from "@/lib/accessToken";
import { NextRequest, NextResponse } from "next/server";
import { getProductionUrl } from "../../baseUrl";

export async function GET(req: NextRequest) {
    const accessToken = await getAccessToken(req, getProductionUrl());

    if (!accessToken) {
        return NextResponse.json(
            { error: "Missing access_token" },
            { status: 400 },
        );
    }

    return NextResponse.json({ result: "ok" });
}

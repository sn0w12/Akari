import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "../../../../../baseUrl";

export async function GET(request: NextRequest) {
    const response = NextResponse.redirect(
        request.headers.get("referer") || `${getBaseUrl()}/`,
    );
    response.cookies.set("access_token", "", { expires: new Date(0) });
    response.cookies.set("refresh_token", "", { expires: new Date(0) });

    return response;
}

import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/api/base-url";

export async function GET() {
    const response = NextResponse.redirect(`${getBaseUrl()}/`);
    response.cookies.set("access_token", "", { expires: new Date(0) });
    response.cookies.set("refresh_token", "", { expires: new Date(0) });

    return response;
}

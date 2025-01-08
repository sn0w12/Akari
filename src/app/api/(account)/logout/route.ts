import { NextResponse } from "next/server";
import { getBaseUrl } from "../../../baseUrl";

export async function GET() {
    const response = NextResponse.redirect(`${getBaseUrl()}/`);
    response.cookies.set("user_acc", "", { expires: new Date(0) });
    response.cookies.set("access_token", "", { expires: new Date(0) });
    response.cookies.set("refresh_token", "", { expires: new Date(0) });

    return response;
}

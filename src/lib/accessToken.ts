import { NextRequest } from "next/server";

async function getAccessToken(req: NextRequest, baseURL: string) {
    let accessToken = req.cookies.get("access_token")?.value;
    if (!accessToken) {
        const accessTokenResponse = await fetch(
            `${baseURL}/api/auth/token/refresh`,
        );
        const accessTokenData = await accessTokenResponse.json();
        if (!accessTokenResponse.ok) {
            return null;
        }
        accessToken = accessTokenData.accessToken.value;
    }
    return accessToken;
}

export { getAccessToken };

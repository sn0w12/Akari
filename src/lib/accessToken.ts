import Cookies from "js-cookie";

async function getAccessToken(): Promise<string | null> {
    const cookies = Cookies.get();
    let accessToken = cookies["access_token"];
    const refreshToken = cookies["refresh_token"];

    if (!accessToken || isTokenHalfwayExpired(accessToken)) {
        if (!refreshToken) {
            return null;
        }

        const tokenResponse = await fetch("/api/auth/token/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!tokenResponse.ok) {
            return null;
        }

        // The new access_token is set automatically in the cookies by the API
        accessToken = Cookies.get("access_token") || "";
        if (accessToken === "") return null;
    }

    return accessToken;
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

export { getAccessToken };

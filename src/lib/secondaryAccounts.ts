import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import Cookies from "js-cookie";
import { baseUrl } from "@/lib/consts";
import { SecondaryAccount } from "@/components/ui/Header/AccountDialog";

export function generateMalAuth(account: SecondaryAccount) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const clientId = process.env.NEXT_PUBLIC_CLIENT_ID!;

    Cookies.set("pkce_code_verifier", codeVerifier, {
        sameSite: "strict",
    });

    const url = new URL("https://myanimelist.net/v1/oauth2/authorize");
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", clientId);
    url.searchParams.append("code_challenge", codeChallenge);
    url.searchParams.append("code_challenge_method", "plain");
    url.searchParams.append("redirect_uri", `${baseUrl}/auth/callback`);

    return { ...account, authUrl: url.toString() };
}

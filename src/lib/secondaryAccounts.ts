import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import Cookies from "js-cookie";
import { baseUrl } from "@/lib/consts";
import { SecondaryAccount } from "@/components/ui/Header/AccountDialog";
import { SECONDARY_ACCOUNTS } from "@/components/ui/Header/AccountDialog";

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

export async function isAccountValid(account: SecondaryAccount) {
    const cache = sessionStorage.getItem(account.sessionKey);
    if (cache === "true") return true;

    const response = await fetch(account.validateEndpoint);
    const data = await response.json();

    sessionStorage.setItem(
        account.sessionKey,
        data.result === "ok" ? "true" : "false",
    );
    return data.result === "ok";
}

export async function validateSecondaryAccounts() {
    const validAccounts = await Promise.all(
        SECONDARY_ACCOUNTS.map(async (account) => {
            return {
                id: account.id,
                name: account.name,
                valid: await isAccountValid(account),
            };
        }),
    );

    console.log("Validated secondary accounts:", validAccounts);
    return validAccounts;
}

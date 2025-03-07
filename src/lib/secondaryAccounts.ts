import { generateCodeVerifier, generateCodeChallenge } from "@/lib/pkce";
import Cookies from "js-cookie";
import { baseUrl } from "@/lib/consts";

export interface SecondaryAccount {
    id: string;
    name: string;
    displayName: string;
    user: any | null;
    authUrl?: string;
    buttonColor: string;
    hoverColor: string;
    storageKey: string;
    sessionKey: string;
    apiEndpoint: string;
    validateEndpoint: string;
}

export const SECONDARY_ACCOUNTS: SecondaryAccount[] = [
    {
        id: "mal",
        name: "MyAnimeList",
        displayName: "MAL",
        user: null,
        buttonColor: "bg-blue-600",
        hoverColor: "hover:bg-blue-500",
        storageKey: "mal_user",
        sessionKey: "mal",
        apiEndpoint: "/api/logout/mal",
        validateEndpoint: "/api/mal/isLoggedIn",
    },
];

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
    if (cache === "false") return false;

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

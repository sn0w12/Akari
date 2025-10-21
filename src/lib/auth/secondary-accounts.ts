import { generateCodeVerifier, generateCodeChallenge } from "./mal";
import Cookies from "js-cookie";
import { baseUrl } from "@/lib/consts";
import { ApiUrl, fetchApi, isApiErrorResponse } from "../api";

export interface SecondaryAccount {
    id: string;
    name: string;
    displayName: string;
    user: { name: string } | null;
    authUrl?: string;
    buttonColor: string;
    hoverColor: string;
    storageKey: string;
    sessionKey: string;
    apiEndpoint: ApiUrl;
    validateEndpoint: ApiUrl;
}

export const SECONDARY_ACCOUNTS = [
    {
        id: "mal",
        name: "MyAnimeList",
        displayName: "MAL",
        user: null,
        buttonColor: "bg-blue-600",
        hoverColor: "hover:bg-blue-500",
        storageKey: "mal_user",
        sessionKey: "mal",
        apiEndpoint: "/api/v1/mal/logout",
        validateEndpoint: "/api/v1/mal/isLoggedIn",
    },
] as const satisfies SecondaryAccount[];
export type SecondaryAccountId = (typeof SECONDARY_ACCOUNTS)[number]["id"];

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

export async function isAccountValid(accountId: SecondaryAccountId) {
    const account = SECONDARY_ACCOUNTS.find((acc) => acc.id === accountId);
    if (!account) throw new Error(`Unknown account ID: ${accountId}`);

    const cache = sessionStorage.getItem(account.sessionKey);
    if (cache === "true") return true;
    if (cache === "false") return false;

    const response = await fetchApi<{ result: string }>(
        account.validateEndpoint
    );
    if (isApiErrorResponse(response)) {
        console.error(
            `Error validating ${account.name} account:`,
            response.data.message
        );
        return false;
    }

    sessionStorage.setItem(
        account.sessionKey,
        response.data.result === "ok" ? "true" : "false"
    );
    return response.data.result === "ok";
}

export async function validateSecondaryAccounts() {
    const validAccounts = await Promise.all(
        SECONDARY_ACCOUNTS.map(async (account) => {
            return {
                id: account.id,
                name: account.name,
                valid: await isAccountValid(account.id),
            };
        })
    );

    console.log("Validated secondary accounts:", validAccounts);
    return validAccounts;
}

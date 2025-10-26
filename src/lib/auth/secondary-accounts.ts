import { generateCodeVerifier, generateCodeChallenge } from "./mal";
import Cookies from "js-cookie";
import { baseUrl } from "@/lib/consts";
import { client } from "../api";
import {
    checkMalAuthorization,
    logOutMal,
} from "../manga/secondary-accounts/mal";

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
    logOut: () => Promise<boolean>;
    validate: () => Promise<boolean>;
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
        logOut: logOutMal,
        validate: checkMalAuthorization,
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

    const valid = await account.validate();

    sessionStorage.setItem(account.sessionKey, valid ? "true" : "false");
    return valid;
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

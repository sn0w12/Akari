import { client } from "@/lib/api";
import { setCookie } from "@/lib/utils";
import { getSecondaryAccountById } from "../secondary-accounts";
import { getBaseUrl } from "@/lib/api/base-url";
import { StorageManager } from "@/lib/storage";
import { SecondaryAccountBase } from "./general";
import Cookies from "js-cookie";

export class MalAccount extends SecondaryAccountBase {
    readonly id = "mal";
    readonly name = "MyAnimeList";
    readonly color = "#2b4c95";

    getAuthUrl(): string {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        const clientId = process.env.NEXT_PUBLIC_MAL_CLIENT_ID!;

        setCookie("pkce_code_verifier", codeVerifier, "necessary");

        const url = new URL("https://myanimelist.net/v1/oauth2/authorize");
        url.searchParams.append("response_type", "code");
        url.searchParams.append("client_id", clientId);
        url.searchParams.append("code_challenge", codeChallenge);
        url.searchParams.append("code_challenge_method", "plain");
        url.searchParams.append(
            "redirect_uri",
            `${getBaseUrl()}/auth/callback`
        );

        return url.toString();
    }

    async logOut(): Promise<boolean> {
        const { error } = await client.POST("/v2/mal/logout");

        if (error) {
            return false;
        }

        const malAccount = getSecondaryAccountById("mal");
        if (malAccount) {
            const cacheStorage = StorageManager.get("secondaryAccountCache");
            cacheStorage.remove({ accountId: malAccount.id });
        }

        return true;
    }

    async validate(): Promise<boolean> {
        const { error } = await client.GET("/v2/mal/mangalist", {
            params: {
                query: {
                    limit: 1,
                },
            },
        });

        if (error) {
            return false;
        }

        return true;
    }

    async sync(
        manga: components["schemas"]["ChapterResponse"]
    ): Promise<boolean> {
        if (!manga.malId) {
            return false;
        }

        try {
            const { error } = await client.POST("/v2/mal/mangalist", {
                body: {
                    mangaId: manga.malId,
                    numChaptersRead: manga.number,
                },
            });

            if (error) {
                return false;
            }

            return true;
        } catch {
            return false;
        }
    }

    async handleCallback(
        params: Record<string, string>,
        hash: string,
        origin: string
    ): Promise<boolean> {
        const code = params.code;
        const codeVerifier = Cookies.get("pkce_code_verifier");

        if (!code || !codeVerifier) {
            return false;
        }

        const redirectUri = `${origin}/auth/callback`;
        const { error } = await client.POST("/v2/mal/token", {
            body: {
                code,
                codeVerifier,
                redirectUri,
            },
        });

        if (error) {
            return false;
        }

        const { error: userError } = await client.GET("/v2/mal/mangalist", {
            params: {
                query: {
                    limit: 1,
                },
            },
        });

        if (userError) {
            return false;
        }

        Cookies.remove("pkce_code_verifier");
        return true;
    }
}

function generateCodeVerifier(length = 128): string {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
    let codeVerifier = "";
    for (let i = 0; i < length; i++) {
        codeVerifier += characters.charAt(
            Math.floor(Math.random() * characters.length)
        );
    }
    return codeVerifier;
}

function generateCodeChallenge(codeVerifier: string): string {
    // MAL requires the plain method, so the challenge is the same as the verifier
    return codeVerifier;
}

import { SecondaryAccountBase } from "./general";
import { client } from "@/lib/api";
import { StorageManager } from "@/lib/storage";

export class AniAccount extends SecondaryAccountBase {
    readonly id = "ani";
    readonly name = "AniList";
    readonly color = "#1f232c";
    readonly userStorage = StorageManager.get("aniListUser");

    getAuthUrl(): string {
        const clientId = process.env.NEXT_PUBLIC_ANI_CLIENT_ID!;

        const url = new URL("https://anilist.co/api/v2/oauth/authorize");
        url.searchParams.append("response_type", "token");
        url.searchParams.append("client_id", clientId);

        return url.toString();
    }

    async doLogOut(): Promise<boolean> {
        const { error } = await client.POST("/v2/ani/logout");
        if (error) {
            return false;
        }

        return true;
    }

    async validate(): Promise<boolean> {
        const { data, error } = await client.GET("/v2/ani/me");
        if (error) {
            return false;
        }

        this.userStorage.set({
            id: data.data.id,
            name: data.data.name,
        });
        return true;
    }

    async sync(
        manga: components["schemas"]["ChapterResponse"],
    ): Promise<boolean> {
        if (!manga.aniId) {
            return false;
        }

        const { error } = await client.POST("/v2/ani/mangalist", {
            body: {
                mediaId: manga.aniId,
                progress: manga.number,
            },
        });

        if (error) {
            return false;
        }

        return true;
    }

    async handleCallback(
        params: Record<string, string>,
        hash: string,
        origin: string,
    ): Promise<boolean> {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const expiresIn = hashParams.get("expires_in");

        if (!accessToken) {
            return false;
        }

        const { error } = await client.GET("/v2/ani/me", {
            params: {
                query: {
                    access_token: accessToken,
                    expires_in: Number(expiresIn) || 0,
                },
            },
        });

        if (error) {
            return false;
        }

        return true;
    }
}

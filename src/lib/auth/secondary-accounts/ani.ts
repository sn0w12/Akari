import { SecondaryAccountBase } from "./general";
import { client } from "@/lib/api";
import { StorageManager } from "@/lib/storage";
import Cookies from "js-cookie";

export class AniAccount extends SecondaryAccountBase {
    readonly id = "ani";
    readonly name = "AniList";
    readonly color = "#1f232c";

    getAuthUrl(): string {
        const clientId = process.env.NEXT_PUBLIC_ANI_CLIENT_ID!;

        const url = new URL("https://anilist.co/api/v2/oauth/authorize");
        url.searchParams.append("response_type", "token");
        url.searchParams.append("client_id", clientId);

        return url.toString();
    }

    logOut(): Promise<boolean> {
        Cookies.remove("ani_access_token", { path: "/" });
        return Promise.resolve(true);
    }

    async validate(): Promise<boolean> {
        const { data, error } = await client.GET("/v2/ani/me");
        if (error) {
            return false;
        }

        const aniListUserStorage = StorageManager.get("aniListUser");
        aniListUserStorage.set({
            id: data.data.id,
            name: data.data.name,
        });
        return true;
    }

    async sync(
        manga: components["schemas"]["ChapterResponse"]
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

    handleCallback(
        params: Record<string, string>,
        hash: string,
        origin: string
    ): Promise<boolean> {
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const expiresIn = hashParams.get("expires_in");

        if (!accessToken) {
            return Promise.resolve(false);
        }

        Cookies.set("ani_access_token", accessToken, {
            path: "/",
            sameSite: "None",
            secure: true,
            expires: new Date(
                Date.now() + parseInt(expiresIn || "0", 10) * 1000
            ),
        });
        return Promise.resolve(true);
    }
}

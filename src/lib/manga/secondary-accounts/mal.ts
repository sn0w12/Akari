import { client } from "@/lib/api";

export async function syncMal(manga: components["schemas"]["ChapterResponse"]) {
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

export async function checkMalAuthorization() {
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

export async function logOutMal() {
    const { error } = await client.POST("/v2/mal/logout");

    if (error) {
        return false;
    }

    return true;
}

"use client";

import { client } from "@/lib/api";
import { useSetting } from "@/lib/settings";
import { useEffect } from "react";

export function ViewManga({ mangaId }: { mangaId: string }) {
    const allowAnalytics = useSetting("allowAnalytics");

    useEffect(() => {
        async function recordMangaView() {
            const { error } = await client.POST("/v2/manga/{id}/view", {
                params: {
                    path: {
                        id: mangaId,
                    },
                },
                body: {
                    saveUserId: allowAnalytics,
                },
            });
            if (error) {
                console.error("Error recording manga view:", error);
            }
        }

        recordMangaView();
    }, [mangaId, allowAnalytics]);

    return null;
}

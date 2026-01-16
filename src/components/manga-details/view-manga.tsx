"use client";

import { useUser } from "@/contexts/user-context";
import { client } from "@/lib/api";
import { useEffect } from "react";

export function ViewManga({
    manga,
}: {
    manga: components["schemas"]["MangaResponse"];
}) {
    const { user } = useUser();

    useEffect(() => {
        async function recordMangaView() {
            if (!user) return;
            const { error } = await client.POST("/v2/manga/{id}/view", {
                params: {
                    path: {
                        id: manga.id,
                    },
                },
            });
            if (error) {
                console.error("Error recording manga view:", error);
            }
        }

        recordMangaView();
    }, [manga, user]);

    return null;
}

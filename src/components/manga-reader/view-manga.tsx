"use client";

import { useEffect } from "react";
import { client } from "@/lib/api";
import { useUser } from "@/contexts/user-context";

export function ViewManga({
    manga,
}: {
    manga: components["schemas"]["MangaDetailResponse"];
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

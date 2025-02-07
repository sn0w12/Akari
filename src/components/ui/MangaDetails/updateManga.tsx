"use client";

import { useEffect } from "react";
import { fetchMalData } from "@/lib/malSync";
import { MangaDetails } from "@/app/api/interfaces";

interface UpdateMangaProps {
    manga: MangaDetails;
    lastUpdate: string;
}

export function UpdateManga({ manga, lastUpdate }: UpdateMangaProps) {
    useEffect(() => {
        const update = async () => {
            await fetchMalData(manga.identifier, false, 1, 0, false);
        };

        const lastUpdateDate = new Date(lastUpdate);
        const oneDayInMs = 24 * 60 * 60 * 1000;
        if (Date.now() - lastUpdateDate.getTime() < oneDayInMs) {
            return;
        }

        update();
    }, [manga]);

    return null;
}

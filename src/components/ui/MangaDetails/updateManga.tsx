"use client";

import { useEffect } from "react";
import { fetchMalData } from "@/lib/malSync";
import { MangaDetails } from "@/app/api/interfaces";

interface UpdateMangaProps {
    manga: MangaDetails;
}

export function UpdateManga({ manga }: UpdateMangaProps) {
    useEffect(() => {
        const update = async () => {
            await fetchMalData(manga.identifier, false, 1, 0, false);
        };

        update();
    }, [manga]);

    return null;
}

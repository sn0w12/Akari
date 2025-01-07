import { SmallManga } from "@/app/api/interfaces";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getMangaArrayFromSupabase } from "./supabase";

export function getUserData(cookieStore: ReadonlyRequestCookies) {
    const userAccCookie = cookieStore.get("user_acc")?.value || "{}";
    const userAcc = JSON.parse(userAccCookie);

    if (!userAcc) {
        return null;
    }

    return userAcc.user_data;
}

export async function replaceImages(manga: SmallManga[]) {
    const identifiers = manga.map((m) => m.id);
    const malDataArray = await getMangaArrayFromSupabase(identifiers);
    manga.forEach((m) => {
        const malData = malDataArray.find((data) => data?.identifier === m.id);
        if (malData?.imageUrl) {
            m.image = malData.imageUrl;
        }
    });
}

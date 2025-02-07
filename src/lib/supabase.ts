import { HqMangaCacheItem } from "@/app/api/interfaces";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabasePublic =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;
const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

function transformMangaData(data: any): HqMangaCacheItem | null {
    if (!data) return null;
    return {
        identifier: data.identifier,
        titles: data.titles,
        imageUrl: data.image_url,
        smallImageUrl: data.small_image_url,
        url: data.url,
        score: data.score,
        description: data.description,
        malUrl: data.mal_url,
        aniUrl: data.ani_url,
        up_to_date: undefined,
        is_strip: undefined,
        updated_at: data.updated_at,
    };
}

export async function getMangaFromSupabase(identifier: string) {
    if (!supabasePublic) {
        console.warn("Supabase not initialized, skipping query");
        return null;
    }

    try {
        const { data, error } = await supabasePublic
            .from("mal_data")
            .select("*")
            .eq("identifier", identifier)
            .single();

        if (error) {
            if (error.code !== "PGRST116") {
                console.error("Supabase error details:", error);
            }
            return null;
        }

        return transformMangaData(data);
    } catch (e) {
        console.error("Supabase query error:", e);
        return null;
    }
}

export async function getMangaArrayFromSupabase(identifiers: string[]) {
    if (!supabasePublic) {
        console.warn("Supabase not initialized, skipping query");
        return [];
    }

    try {
        const { data, error } = await supabasePublic
            .from("mal_data")
            .select("identifier, image_url")
            .in("identifier", identifiers)
            .order("identifier", { ascending: true });

        if (error) {
            if (error.code !== "PGRST116") {
                console.error("Supabase error details:", error);
            }
            return [];
        }

        // Return a simplified structure
        return data.map((item) => ({
            identifier: item.identifier,
            imageUrl: item.image_url,
        }));
    } catch (e) {
        console.error("Supabase query error:", e);
        return [];
    }
}

export async function saveMangaToSupabase(identifier: string, mangaData: any) {
    if (!supabaseAdmin) {
        console.warn("Supabase not initialized, skipping query");
        return null;
    }
    const { data, error } = await supabaseAdmin
        .from("mal_data")
        .upsert([
            {
                identifier,
                titles: mangaData.titles,
                image_url: mangaData.imageUrl,
                small_image_url: mangaData.smallImageUrl,
                url: mangaData.url,
                score: mangaData.score,
                description: mangaData.description,
                mal_url: mangaData.malUrl,
                ani_url: mangaData.aniUrl,
                updated_at: new Date().toISOString(),
            },
        ])
        .select();

    if (error) {
        console.error("Error saving to Supabase:", error);
        return null;
    }
    return data;
}

export interface UserMangaProgress {
    user_id: string;
    manga_identifier: string;
    last_read_chapter: number;
    added_at: string;
    updated_at: string;
    up_to_date: boolean;
}

export async function saveUserMangaProgress(
    userId: string,
    mangaIdentifier: string,
    lastChapter: number,
    upToDate: boolean = false,
) {
    if (!supabaseAdmin) {
        console.warn("Supabase not initialized, skipping query");
        return null;
    }

    const { data, error } = await supabaseAdmin
        .from("user_manga_progress")
        .upsert({
            user_id: userId,
            manga_identifier: mangaIdentifier,
            last_read_chapter: lastChapter,
            up_to_date: upToDate,
            updated_at: new Date().toISOString(),
            added_at: new Date().toISOString(), // Only used for new entries
        })
        .select();

    if (error) {
        console.error("Error saving user manga progress:", error);
        return null;
    }
    return data[0];
}

export async function updateUserMangaProgress(
    userId: string,
    mangaIdentifier: string,
    lastChapter: number,
    upToDate: boolean = false,
) {
    if (!supabaseAdmin) {
        console.warn("Supabase not initialized, skipping query");
        return null;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("user_manga_progress")
            .update({
                last_read_chapter: lastChapter,
                up_to_date: upToDate,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("manga_identifier", mangaIdentifier)
            .select();

        if (error || !data || data.length === 0) {
            return await saveUserMangaProgress(
                userId,
                mangaIdentifier,
                lastChapter,
                upToDate,
            );
        }

        return data[0] as UserMangaProgress;
    } catch (e) {
        console.error("Error updating user manga:", e);
        return null;
    }
}

export async function getUserManga(userId: string, mangaIdentifier: string) {
    if (!supabasePublic) {
        console.warn("Supabase not initialized, skipping query");
        return null;
    }

    try {
        const progressData = supabasePublic
            .from("user_manga_progress")
            .select("*")
            .eq("user_id", userId)
            .eq("manga_identifier", mangaIdentifier)
            .single();

        return progressData;
    } catch (e) {
        console.error("Error fetching user manga:", e);
        return null;
    }
}

export async function getUserMangaArray(
    userId: string,
    identifiers?: string[],
) {
    if (!supabasePublic) {
        console.warn("Supabase not initialized, skipping query");
        return [];
    }

    try {
        let progressQuery = supabasePublic
            .from("user_manga_progress")
            .select("*")
            .eq("user_id", userId);

        if (identifiers) {
            progressQuery = progressQuery.in("manga_identifier", identifiers);
        }

        const { data: progressData, error: progressError } =
            await progressQuery;

        if (progressError) {
            console.error("Error fetching user progress:", progressError);
            return [];
        }

        return progressData;
    } catch (e) {
        console.error("Error fetching user manga array:", e);
        return [];
    }
}

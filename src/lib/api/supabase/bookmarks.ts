import { getUserIdentifier, supabaseAdmin } from "../supabase";
import { SmallBookmark, MalData } from "@/types/manga";

export interface RawBookmark {
    manga_id: string;
    manga_name: string;
    manga_image: string | null;
    latest_chapter: string;
    last_read_at: string;
    created_at: string;
    updated_at: string;
}

export async function saveBookmark(
    externalUsername: string,
    mangaData: SmallBookmark
) {
    if (!supabaseAdmin) {
        console.warn("Supabase admin not initialized, skipping saveBookmark");
        return;
    }

    try {
        const userIdentifier = await getUserIdentifier(externalUsername);
        // Use upsert to insert or update in one operation
        const { data, error } = await supabaseAdmin
            .from("akari_bookmarks")
            .upsert(
                {
                    user_identifier: userIdentifier,
                    manga_id: mangaData.mangaId,
                    manga_name: mangaData.mangaName,
                    manga_image: mangaData.mangaImage,
                    latest_chapter: mangaData.latestChapter,
                    last_read_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_identifier,manga_id",
                    ignoreDuplicates: false,
                }
            )
            .select();

        if (error) {
            console.error(
                "Error upserting bookmark:",
                error.message || error.code || error
            );
            throw error;
        }
        return data[0];
    } catch (error) {
        console.error("Error saving bookmark:", error);
        throw error;
    }
}

export async function getUserBookmarks(externalUsername: string) {
    if (!supabaseAdmin) {
        throw new Error("Supabase admin not initialized");
    }

    try {
        const userIdentifier = await getUserIdentifier(externalUsername);
        const { data, error } = await supabaseAdmin.rpc(
            "get_user_bookmarks_with_mal_data",
            {
                user_id_param: userIdentifier,
            }
        );

        if (error) throw error;
        const bookmarks = data || [];

        interface BookmarkWithMalData extends RawBookmark {
            mal_data: MalData;
            malData: MalData;
        }

        const bookmarksWithMalData: BookmarkWithMalData[] = bookmarks.map(
            (bookmark: RawBookmark & { mal_data: MalData }) => ({
                ...bookmark,
                malData: bookmark.mal_data,
            })
        );

        return bookmarksWithMalData;
    } catch (error) {
        console.error("Error fetching bookmarks:", error);
        throw error;
    }
}

export async function getMangaBookmark(
    externalUsername: string,
    mangaId: string
) {
    if (!supabaseAdmin) {
        throw new Error("Supabase admin not initialized");
    }

    try {
        const userIdentifier = await getUserIdentifier(externalUsername);
        const { data, error } = await supabaseAdmin
            .from("akari_bookmarks")
            .select("*")
            .eq("user_identifier", userIdentifier)
            .eq("manga_id", mangaId)
            .single();

        if (error && error.code !== "PGRST116") throw error;
        return data;
    } catch (error) {
        console.error("Error fetching manga bookmark:", error);
        throw error;
    }
}

export async function saveBookmarksBatch(
    externalUsername: string,
    mangaDataArray: SmallBookmark[]
) {
    if (!supabaseAdmin) {
        console.warn(
            "Supabase admin not initialized, skipping saveBookmarksBatch"
        );
        return [];
    }

    try {
        const userIdentifier = await getUserIdentifier(externalUsername);
        const promises = mangaDataArray.map(async (mangaData) => {
            const { data, error } = await supabaseAdmin!
                .from("akari_bookmarks")
                .upsert(
                    {
                        user_identifier: userIdentifier,
                        manga_id: mangaData.mangaId,
                        manga_name: mangaData.mangaName,
                        manga_image: mangaData.mangaImage,
                        latest_chapter: mangaData.latestChapter,
                        last_read_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    {
                        onConflict: "user_identifier,manga_id",
                        ignoreDuplicates: false,
                    }
                )
                .select();

            if (error) {
                console.error(
                    "Error upserting bookmark:",
                    error.message || error.code || error
                );
                return {
                    success: false,
                    mangaId: mangaData.mangaId,
                    error: error.message,
                };
            }
            return { success: true, mangaId: mangaData.mangaId, data: data[0] };
        });

        const results = await Promise.allSettled(promises);
        return results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            } else {
                return {
                    success: false,
                    mangaId: mangaDataArray[index].mangaId,
                    error: result.reason.message,
                };
            }
        });
    } catch (error) {
        console.error("Error saving bookmarks batch:", error);
        throw error;
    }
}

export async function searchUserBookmarks(
    externalUsername: string,
    query: string
) {
    if (!supabaseAdmin) {
        throw new Error("Supabase admin not initialized");
    }

    try {
        const userIdentifier = await getUserIdentifier(externalUsername);
        const escapedQuery = query.replace(/'/g, "''");
        const { data, error } = await supabaseAdmin.rpc("search_bookmarks", {
            user_id: userIdentifier,
            search_query: escapedQuery,
        });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Error searching bookmarks:", error);
        throw error;
    }
}

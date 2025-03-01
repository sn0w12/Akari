import { HqMangaCacheItem, ReadingHistoryEntry } from "@/app/api/interfaces";
import { createClient } from "@supabase/supabase-js";
import * as crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const USER_ID_HASH_KEY = process.env.USER_ID_HASH_KEY || null;

export const supabasePublic =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;
const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

export function userDataToUserId(userData: string | null): string | null {
    if (!userData) return null;
    const parts = userData.split(".");
    return parts.length === 3 ? parts[1] : null;
}

/**
 * Encode a user ID to protect it in the database
 * Uses HMAC-SHA256 for consistent but secure one-way transformation
 */
export function encodeUserId(userId: string): string {
    if (!userId) return "";
    if (!USER_ID_HASH_KEY) return userId;
    return crypto
        .createHmac("sha256", USER_ID_HASH_KEY)
        .update(userId)
        .digest("hex");
}

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

/**
 * Save a reading history entry to Supabase
 */
export async function saveReadingHistoryEntry(
    userId: string,
    entry: Omit<ReadingHistoryEntry, "id" | "userId" | "readAt">,
): Promise<ReadingHistoryEntry | null> {
    console.log(entry);
    if (!supabaseAdmin) {
        console.warn("Supabase admin not initialized");
        return null;
    }

    // Encode the user ID before storing in the database
    const encodedUserId = encodeUserId(userId);

    try {
        const { data, error } = await supabaseAdmin
            .from("reading_history")
            .upsert({
                user_id: encodedUserId,
                manga_id: entry.mangaId,
                manga_title: entry.mangaTitle,
                image: entry.image,
                chapter_id: entry.chapterId,
                chapter_title: entry.chapterTitle,
                read_at: new Date().toISOString(),
            })
            .select();

        if (error) {
            console.error("Error saving reading history:", error);
            return null;
        }

        if (!data || data.length === 0) return null;

        return {
            id: data[0].id,
            userId: userId, // Return the original user ID to the client
            mangaId: data[0].manga_id,
            mangaTitle: data[0].manga_title,
            image: data[0].image,
            chapterId: data[0].chapter_id,
            chapterTitle: data[0].chapter_title,
            readAt: new Date(data[0].read_at),
        };
    } catch (e) {
        console.error("Exception saving reading history:", e);
        return null;
    }
}

/**
 * Get reading history for a user with pagination
 */
export async function getUserReadingHistory(
    userId: string,
    limit = 10,
    offset = 0,
): Promise<ReadingHistoryEntry[]> {
    if (!supabasePublic) {
        console.warn("Supabase not initialized");
        return [];
    }

    // Encode the user ID for database lookup
    const encodedUserId = encodeUserId(userId);

    try {
        const { data, error } = await supabasePublic
            .from("reading_history")
            .select("*")
            .eq("user_id", encodedUserId)
            .order("read_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error("Error fetching reading history:", error);
            return [];
        }

        if (!data || data.length === 0) return [];

        // Get unique manga IDs to fetch high-quality images
        const mangaIds = [...new Set(data.map((entry) => entry.manga_id))];

        // Fetch high-quality images from mal_data
        const { data: malData, error: malError } = await supabasePublic
            .from("mal_data")
            .select("identifier, image_url")
            .in("identifier", mangaIds);

        // Create a map of manga_id to high-quality image URL
        const highQualityImages: Record<string, string> = {};
        if (malData && !malError) {
            malData.forEach((item) => {
                if (item.image_url) {
                    highQualityImages[item.identifier] = item.image_url;
                }
            });
        }

        return data.map((entry) => ({
            id: entry.id,
            userId: userId, // Return the original user ID to the client
            mangaId: entry.manga_id,
            mangaTitle: entry.manga_title,
            // Use high-quality image if available, otherwise fall back to stored image
            image: highQualityImages[entry.manga_id] || entry.image,
            chapterId: entry.chapter_id,
            chapterTitle: entry.chapter_title,
            chapterNumber: entry.chapter_number,
            readAt: new Date(entry.read_at),
        }));
    } catch (e) {
        console.error("Exception fetching reading history:", e);
        return [];
    }
}

/**
 * Get reading history count data for charts
 */
export async function getUserReadingStats(
    userId: string,
    period: "24h" | "7d" | "30d" = "7d",
): Promise<{ date: string; count: number }[]> {
    if (!supabasePublic) {
        console.warn("Supabase not initialized");
        return [];
    }

    // Encode the user ID for database lookup
    const encodedUserId = encodeUserId(userId);

    // Calculate start date based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
        case "24h":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            break;
        case "7d":
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case "30d":
        default:
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
    }

    try {
        const { data, error } = await supabasePublic
            .from("reading_history")
            .select("read_at")
            .eq("user_id", encodedUserId)
            .gte("read_at", startDate.toISOString());

        if (error) {
            console.error("Error fetching reading stats:", error);
            return [];
        }

        if (!data) return [];

        const readDates = data.map((entry) => new Date(entry.read_at));
        const dateFormat: Intl.DateTimeFormatOptions =
            period === "24h"
                ? { hour: "2-digit" }
                : period === "7d"
                  ? { weekday: "short" }
                  : { month: "short", day: "numeric" };

        // Group by formatted date
        const countsByDate: Record<string, number> = {};
        readDates.forEach((date) => {
            const formattedDate = new Intl.DateTimeFormat(
                "en-US",
                dateFormat,
            ).format(date);
            countsByDate[formattedDate] =
                (countsByDate[formattedDate] || 0) + 1;
        });

        return Object.entries(countsByDate).map(([date, count]) => ({
            date,
            count,
        }));
    } catch (e) {
        console.error("Exception fetching reading stats:", e);
        return [];
    }
}

/**
 * Delete a reading history entry
 */
export async function deleteReadingHistoryEntry(
    userId: string,
    entryId: string,
): Promise<boolean> {
    if (!supabaseAdmin) {
        console.warn("Supabase admin not initialized");
        return false;
    }

    // Encode the user ID for database lookup
    const encodedUserId = encodeUserId(userId);

    try {
        const { error } = await supabaseAdmin
            .from("reading_history")
            .delete()
            .match({ id: entryId, user_id: encodedUserId });

        if (error) {
            console.error("Error deleting reading history entry:", error);
            return false;
        }

        return true;
    } catch (e) {
        console.error("Exception deleting reading history:", e);
        return false;
    }
}

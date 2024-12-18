import { HqMangaCacheItem } from "@/app/api/interfaces";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Public client for reading
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Only initialize admin client if service key is available
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

function transformMangaData(data: any): HqMangaCacheItem | null {
    if (!data) return null;
    return {
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
    };
}

export async function getMangaFromSupabase(identifier: string) {
    try {
        console.log(`Fetching manga data for identifier: ${identifier}`);
        const { data, error } = await supabasePublic
            .from("manga")
            .select("*")
            .eq("identifier", identifier)
            .single();

        if (error) {
            console.error("Supabase error details:", error);
            throw new Error(`Error fetching from Supabase: ${error.message}`);
        }

        console.log(`Supabase data received:`, data);
        return transformMangaData(data);
    } catch (e) {
        console.error("Unexpected error in getMangaFromSupabase:", e);
        return null;
    }
}

export async function saveMangaToSupabase(identifier: string, mangaData: any) {
    if (!supabaseAdmin) {
        throw new Error(
            "SUPABASE_SERVICE_ROLE_KEY is required for this operation",
        );
    }
    const { data, error } = await supabaseAdmin
        .from("manga")
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

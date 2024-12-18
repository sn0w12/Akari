import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public client for reading
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for writing (only use server-side)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getMangaFromSupabase(identifier: string) {
    const { data, error } = await supabasePublic
        .from("manga")
        .select("*")
        .eq("identifier", identifier)
        .single();

    if (error) {
        console.error("Error fetching from Supabase:", error);
        return null;
    }
    return data;
}

export async function saveMangaToSupabase(identifier: string, mangaData: any) {
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

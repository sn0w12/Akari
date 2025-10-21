import { MalData } from "@/types/manga";
import { supabasePublic } from "../supabase";

export async function getMangaFromSupabase(
    identifier: string
): Promise<MalData | null> {
    if (!supabasePublic) {
        console.warn("Supabase not initialized, skipping query");
        return null;
    }

    try {
        const { data, error } = await supabasePublic
            .from("akari_mal_data")
            .select("*")
            .eq("id", identifier)
            .single();

        if (error) {
            if (error.code !== "PGRST116") {
                console.error("Supabase error details:", error);
            }
            return null;
        }

        return data;
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
            .from("akari_mal_data")
            .select("id, image")
            .in("id", identifiers)
            .order("id", { ascending: true });

        if (error) {
            if (error.code !== "PGRST116") {
                console.error("Supabase error details:", error);
            }
            return [];
        }

        return data.map((item) => ({
            identifier: item.id,
            imageUrl: item.image,
        }));
    } catch (e) {
        console.error("Supabase query error:", e);
        return [];
    }
}

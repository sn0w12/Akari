import { createClient } from "@supabase/supabase-js";
import { hashUsername } from "../auth/user";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const secretSalt = process.env.USER_HASH_SECRET!;

export const supabasePublic =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;
export const supabaseAdmin =
    process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseUrl
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY)
        : null;

export async function getUserIdentifier(externalUsername: string) {
    return await hashUsername(externalUsername, secretSalt);
}

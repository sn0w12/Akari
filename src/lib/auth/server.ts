import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { env } from "@/lib/env";

export async function createClient() {
    return createServerClient(
        env("VITE_SUPABASE_URL")!,
        env("VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY")!,
        {
            cookies: {
                getAll() {
                    return Object.entries(getCookies()).map(
                        ([name, value]) => ({ name, value }),
                    );
                },
                setAll(cookies) {
                    cookies.forEach(({ name, value, options }) => {
                        setCookie(name, value, options);
                    });
                },
            },
        },
    );
}

export async function getAuthToken() {
    try {
        const supabase = await createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();
        return session?.access_token;
    } catch {
        return undefined;
    }
}

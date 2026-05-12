import { createServerClient } from "@supabase/ssr";
import { getCookies, setCookie } from "@tanstack/react-start/server";
import { createStart, createMiddleware } from "@tanstack/react-start";
import { redirect } from "@tanstack/react-router";
import { env } from "@/lib/env";

const protectedRoutes = ["/bookmarks", "/account"];

const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const url = new URL(request.url);
    const isProtected = protectedRoutes.some((route) =>
        url.pathname.startsWith(route),
    );

    if (isProtected) {
        const supabaseUrl = env("VITE_SUPABASE_URL");
        const supabaseKey = env("VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY");
        if (supabaseUrl && supabaseKey) {
            const supabase = createServerClient(supabaseUrl, supabaseKey, {
                cookies: {
                    getAll() {
                        return Object.entries(getCookies()).map(
                            ([name, value]) => ({ name, value }),
                        );
                    },
                    setAll(cookies) {
                        cookies.forEach((cookie) => {
                            setCookie(cookie.name, cookie.value);
                        });
                    },
                },
            });
            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                throw redirect({ to: "/auth/login" });
            }
        }
    }
    return next();
});

export const startInstance = createStart(() => ({
    requestMiddleware: [authMiddleware],
}));

import { env } from "@/lib/env";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";
import {
    getCookies,
    setCookie,
    setResponseHeader,
} from "@tanstack/react-start/server";

const protectedRoutes = ["/bookmarks", "/account"];

const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const url = new URL(request.url);
    const isProtected = protectedRoutes.some((route) =>
        url.pathname.startsWith(route),
    );

    const supabaseUrl = env("VITE_SUPABASE_URL");
    const supabaseKey = env("VITE_SUPABASE_PUBLISHABLE_OR_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
        if (isProtected) throw redirect({ to: "/auth/login" });
        return next();
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return Object.entries(getCookies()).map(([name, value]) => ({
                    name,
                    value,
                }));
            },
            setAll(cookies, headers) {
                cookies.forEach(({ name, value, options }) => {
                    setCookie(name, value, options);
                });
                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        try {
                            setResponseHeader(key, value);
                        } catch {
                            // headers may not be settable in all contexts
                        }
                    });
                }
            },
        },
    });

    const { data, error } = await supabase.auth.getUser();

    if (isProtected && (error || !data.user)) {
        throw redirect({ to: "/auth/login" });
    }

    return next();
});

export const startInstance = createStart(() => ({
    requestMiddleware: [authMiddleware],
}));

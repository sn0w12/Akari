import { auth } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";

const protectedRoutes = ["/bookmarks", "/account"];

const authMiddleware = createMiddleware().server(async ({ next, request }) => {
    const url = new URL(request.url);
    const isProtected = protectedRoutes.some((route) =>
        url.pathname.startsWith(route),
    );

    if (!isProtected) {
        return next();
    }

    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session) {
        throw redirect({ to: "/auth/login" });
    }

    return next();
});

export const startInstance = createStart(() => ({
    requestMiddleware: [authMiddleware],
}));

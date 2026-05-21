import "@/globals.css";
import {
    HeadContent,
    Outlet,
    Scripts,
    createRootRoute,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

export const Route = createRootRoute({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content:
                    "width=device-width, initial-scale=1, viewport-fit=cover",
            },
            { title: "Akari Manga" },
        ],
    }),
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <Outlet />
        </RootDocument>
    );
}

function RootDocument({ children }: { children: ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <HeadContent />
            </head>
            <body className="antialiased bg-background md:h-screen flex flex-col antialiased bg-background overflow-y-auto pt-[var(--safe-top)]! md:pt-0! mb-[var(--header-height)] md:mb-0 md:overflow-hidden">
                {children}
                <Scripts />
            </body>
        </html>
    );
}

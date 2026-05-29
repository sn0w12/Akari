import { env } from "@/lib/env";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/v1/revalidate")({
    server: {
        handlers: {
            POST: async ({ request }) => {
                const body = await request.json();
                const { secret, pages, tags } = body;

                if (secret !== env("API_KEY")) {
                    return new Response(
                        JSON.stringify({ message: "Invalid token" }),
                        { status: 401 },
                    );
                }

                const invalidPages =
                    !pages ||
                    !Array.isArray(pages) ||
                    pages.length === 0 ||
                    !pages.every(
                        (page) =>
                            typeof page === "string" &&
                            page.trim() !== "" &&
                            page.startsWith("/"),
                    );
                const invalidTags =
                    !tags || !Array.isArray(tags) || tags.length === 0;

                if (invalidPages || invalidTags) {
                    return new Response(
                        JSON.stringify({
                            message:
                                "Missing or invalid pages or tags parameter",
                        }),
                        { status: 400 },
                    );
                }

                try {
                    // Invalidate tags/pages logic goes here
                    return Response.json({ revalidated: true });
                } catch {
                    return new Response(
                        JSON.stringify({ message: "Error revalidating" }),
                        { status: 500 },
                    );
                }
            },
        },
    },
});

import { createFileRoute } from "@tanstack/react-router";
import { client, serverHeaders } from "@/lib/api";

export const Route = createFileRoute("/mal/$malId")({
    server: {
        handlers: {
            GET: async ({ params }) => {
                const { malId } = params;
                if (!malId) {
                    return new Response(null, { status: 302, headers: { Location: "/" } });
                }

                const { data, error } = await client.GET("/v2/manga/mal/{id}", {
                    params: { path: { id: Number(malId) } },
                    headers: serverHeaders,
                });

                if (error) {
                    return new Response(null, { status: 302, headers: { Location: "/" } });
                }

                return new Response(null, { status: 308, headers: { Location: `/manga/${data.data.id}` } });
            },
        },
    },
});

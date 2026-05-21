import { createFileRoute } from "@tanstack/react-router";
import { client, serverHeaders } from "@/lib/api";

export const Route = createFileRoute("/ani/$id")({
    server: {
        handlers: {
            GET: async ({ params }) => {
                const { id } = params;
                if (!id) {
                    return new Response(null, { status: 302, headers: { Location: "/" } });
                }

                const { data, error } = await client.GET("/v2/manga/ani/{id}", {
                    params: { path: { id: Number(id) } },
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

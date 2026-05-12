import { createFileRoute } from "@tanstack/react-router";
import { decompressUUIDBase58 } from "@/lib/uuid";

export const Route = createFileRoute("/l/$id")({
    server: {
        handlers: {
            GET: async ({ params }) => {
                const { id } = params;
                if (!id) {
                    return new Response(null, { status: 302, headers: { Location: "/" } });
                }
                const decompressedId = decompressUUIDBase58(id);
                return new Response(null, { status: 308, headers: { Location: `/lists/${decompressedId}` } });
            },
        },
    },
});

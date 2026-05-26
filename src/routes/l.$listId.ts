import { createFileRoute } from "@tanstack/react-router";
import { decompressUUIDBase58 } from "@/lib/uuid";

export const Route = createFileRoute("/l/$listId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { listId } = params;
        if (!listId) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/" },
          });
        }
        const decompressedId = decompressUUIDBase58(listId);
        return new Response(null, {
          status: 308,
          headers: { Location: `/lists/${decompressedId}` },
        });
      },
    },
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";
import ErrorPage from "@/components/error-page";
import { decompressUUIDBase58 } from "@/lib/uuid";

export const Route = createFileRoute("/_shortcut/l/$listId/")({
    component: ListShortcut,
    loader: ({ params }) => {
        const { listId } = params;
        if (!listId) return;

        const decompressedId = decompressUUIDBase58(listId);
        throw redirect({
            to: `/lists/$listId`,
            params: { listId: decompressedId },
        });
    },
});

function ListShortcut() {
    return (
        <ErrorPage
            error={{
                result: "Error",
                status: 404,
                data: { message: "List not found" },
            }}
        />
    );
}

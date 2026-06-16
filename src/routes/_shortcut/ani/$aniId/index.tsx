import ErrorPage from "@/components/error-page";
import { client, serverHeaders } from "@/lib/api";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shortcut/ani/$aniId/")({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { aniId } = params;
        if (!aniId) return;

        const { data, error } = await client.GET("/v2/manga/ani/{id}", {
            params: { path: { id: Number(aniId) } },
            headers: serverHeaders,
        });
        if (!data || error) return;

        throw redirect({
            to: `/manga/$mangaId`,
            params: { mangaId: data.data.id },
        });
    },
});

function RouteComponent() {
    return (
        <ErrorPage
            error={{
                result: "Error",
                status: 404,
                data: { message: "Manga not found" },
            }}
        />
    );
}

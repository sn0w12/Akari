import ErrorPage from "@/components/error-page";
import { client } from "@/lib/api";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_shortcut/mal/$malId/")({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { malId } = params;
        if (!malId) return;

        const { data, error } = await client.GET("/v2/manga/mal/{id}", {
            params: { path: { id: Number(malId) } },
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

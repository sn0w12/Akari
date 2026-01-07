import { createFileRoute } from "@tanstack/react-router";
import { MangaDetailsComponent } from "@/components/manga-details";
import { createOgImage } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

async function getManga(id: string) {
    const [
        { data: mangaData, error: mangaError },
        { data: recData, error: recError },
    ] = await Promise.all([
        client.GET("/v2/manga/{id}", {
            params: {
                path: {
                    id,
                },
            },
            headers: serverHeaders,
        }),
        client.GET("/v2/manga/{id}/recommendations", {
            params: {
                path: {
                    id,
                },
                query: {
                    limit: 12,
                },
            },
            headers: serverHeaders,
        }),
    ]);

    if (mangaError) {
        return {
            mangaData: null,
            recData: null,
            error: mangaError,
        };
    }

    if (recError) {
        return {
            mangaData: null,
            recData: null,
            error: recError,
        };
    }

    return {
        mangaData: mangaData.data,
        recData: recData.data,
        error: null,
    };
}

export const Route = createFileRoute("/manga/$id")({
    loader: async ({ params }) => {
        const data = await getManga(params.id);
        return data;
    },
    head: ({ loaderData }) => {
        if (!loaderData || loaderData.error || !loaderData.mangaData) {
            return {
                meta: [
                    {
                        title: "Manga Not Found - Akari",
                    },
                    {
                        name: "description",
                        content: "The requested manga could not be found.",
                    },
                ],
            };
        }

        const manga = loaderData.mangaData;
        const description = truncate(manga.description, 300);

        return {
            meta: [
                {
                    title: `${manga.title} - Akari`,
                },
                {
                    name: "description",
                    content: `Akari Manga - ${description}`,
                },
                {
                    property: "og:title",
                    content: manga.title,
                },
                {
                    property: "og:description",
                    content: `Akari Manga - ${description}`,
                },
                {
                    property: "og:image",
                    content: createOgImage("manga", manga.id),
                },
            ],
        };
    },
    component: MangaPage,
});

function MangaPage() {
    const { mangaData, recData, error } = Route.useLoaderData();

    if (error) {
        return <ErrorPage title="Failed to load manga" error={error} />;
    }

    return <MangaDetailsComponent manga={mangaData!} rec={recData!} />;
}

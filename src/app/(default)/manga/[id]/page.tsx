import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/manga-details";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import { getAllMangaIds } from "@/lib/api/pre-render";
import ErrorPage from "@/components/error-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

export async function generateStaticParams() {
    if (!process.env.API_KEY || process.env.DISABLE_STATIC_GENERATION === "1")
        return [];
    const mangaIds = await getAllMangaIds();

    return mangaIds.map((id) => ({
        id,
    }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { data, error } = await client.GET("/v2/manga/{id}", {
        params: {
            path: {
                id: params.id,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return {
            title: "Manga Not Found",
            description: "The requested manga could not be found.",
        };
    }

    const manga = data.data;
    const description = truncate(manga.description, 300);

    return createMetadata({
        title: manga.title,
        description: description,
        image: `/api/v1/manga/${params.id}/og`,
        canonicalPath: `/manga/${params.id}`,
    });
}

export default async function MangaPage(props: PageProps) {
    const params = await props.params;
    const { data, error } = await client.GET("/v2/manga/{id}", {
        params: {
            path: {
                id: params.id,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage title="Failed to load manga" error={error} />;
    }

    return <MangaDetailsComponent manga={data.data} />;
}

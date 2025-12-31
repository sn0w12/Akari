import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/manga-details";
import { createMetadata, createOgImage } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import { cacheLife, cacheTag } from "next/cache";
import { getAllMangaIds } from "@/lib/api/pre-render";

interface PageProps {
    params: Promise<{ id: string }>;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

const getManga = async (id: string) => {
    "use cache";
    cacheLife("quarterHour");
    cacheTag("manga", `manga-${id}`);

    const { data, error } = await client.GET("/v2/manga/{id}", {
        params: {
            path: {
                id,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data: data.data, error: null };
};

export async function generateStaticParams() {
    let limit = undefined;
    if (!process.env.API_KEY || process.env.DISABLE_STATIC_GENERATION === "1") {
        limit = 1;
    }

    const mangaIds = await getAllMangaIds(limit);
    if (limit === 1) {
        return [{ id: mangaIds[0] }];
    }

    return mangaIds.map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { data, error } = await getManga(params.id);

    if (error) {
        return {
            title: "Manga Not Found",
            description: "The requested manga could not be found.",
        };
    }

    const manga = data;
    const description = truncate(manga.description, 300);

    return createMetadata({
        title: manga.title,
        description: description,
        image: createOgImage("manga", manga.id),
        canonicalPath: `/manga/${params.id}`,
    });
}

export default async function MangaPage(props: PageProps) {
    const params = await props.params;
    const { data, error } = await getManga(params.id);

    if (error) {
        return <ErrorPage title="Failed to load manga" error={error} />;
    }

    return <MangaDetailsComponent manga={data} />;
}

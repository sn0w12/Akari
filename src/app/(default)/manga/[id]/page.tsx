import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/manga-details";
import { cacheLife } from "next/cache";
import { robots } from "@/lib/utils";
import { client } from "@/lib/api";
import ErrorPage from "@/components/error-page";

interface PageProps {
    params: Promise<{ id: string }>;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    "use cache";
    cacheLife("weeks");

    const params = await props.params;
    const { data, error } = await client.GET("/v2/manga/{id}", {
        params: {
            path: {
                id: params.id,
            },
        },
    });

    if (error) {
        return {
            title: "Manga Not Found",
            description: "The requested manga could not be found.",
        };
    }

    const manga = data.data;
    const description = truncate(manga.description, 300);
    let image = `/api/v1/manga/${params.id}/og`;
    if (process.env.NEXT_PUBLIC_HOST) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/api/v1/manga/${params.id}/og`;
    }

    return {
        title: manga.title,
        description,
        robots: robots(),
        openGraph: {
            title: manga.title,
            description,
            type: "website",
            siteName: "Akari Manga",
            images: image,
        },
        twitter: {
            card: "summary_large_image",
            title: manga.title,
            description,
            images: image,
        },
    };
}

export default async function MangaPage(props: PageProps) {
    const params = await props.params;
    const { data, error } = await client.GET("/v2/manga/{id}", {
        params: {
            path: {
                id: params.id,
            },
        },
    });

    if (error) {
        return <ErrorPage title="Failed to load manga" error={error} />;
    }

    return <MangaDetailsComponent manga={data.data} />;
}

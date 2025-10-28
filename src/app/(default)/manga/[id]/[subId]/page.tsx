import { Metadata } from "next";
import { Reader } from "@/components/manga-reader";
import { cacheLife } from "next/cache";
import { robots } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    "use cache";
    cacheLife("weeks");

    const mangaParams = await params;
    const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
        params: {
            path: {
                id: mangaParams.id,
                subId: Number(mangaParams.subId),
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return {
            title: "Chapter Not Found",
            description: "The requested chapter could not be found.",
        };
    }

    const chapter = data.data;
    const title = `${chapter.title} - ${chapter.title}`;
    const description = `Read ${chapter.title} ${chapter.title} for free on Akari Manga.`;
    let image = `/api/v1/manga/${mangaParams.id}/og`;
    if (process.env.NEXT_PUBLIC_HOST) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/api/v1/manga/${mangaParams.id}/og`;
    }

    return {
        title,
        description,
        robots: robots(),
        openGraph: {
            title,
            description,
            type: "website",
            siteName: "Akari Manga",
            images: image,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image,
        },
    };
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    const mangaParams = await params;
    const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
        params: {
            path: {
                id: mangaParams.id,
                subId: Number(mangaParams.subId),
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <div className="bg-background text-foreground">
            <Reader chapter={data.data} />
        </div>
    );
}

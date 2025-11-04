import { Metadata } from "next";
import { Reader } from "@/components/manga-reader";
import { cacheLife } from "next/cache";
import { createMetadata, robots } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import { ChapterComments } from "@/components/manga-reader/chapter-comments";

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
    const title = `${chapter.mangaTitle} - ${chapter.title}`;
    const description = `Read ${chapter.mangaTitle} ${chapter.title}.`;
    let image = `/api/v1/manga/${mangaParams.id}/og`;
    if (process.env.NEXT_PUBLIC_HOST) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/api/v1/manga/${mangaParams.id}/og`;
    }

    return createMetadata({
        title: title,
        description: description,
        image: `/api/v1/manga/${mangaParams.id}/og`,
        canonicalPath: `/manga/${mangaParams.id}`,
    });
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    "use cache";
    cacheLife("hours");

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
            <div className="p-4">
                <ChapterComments chapter={data.data} />
            </div>
        </div>
    );
}

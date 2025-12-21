import { Metadata } from "next";
import { Reader } from "@/components/manga-reader";
import { createMetadata } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { unstable_cache } from "next/cache";

export const revalidate = 60; // Revalidate the page every 60 seconds for frequent comment updates

const getChapter = unstable_cache(
    async (id: string, subId: number) => {
        const { data, error } = await client.GET("/v2/manga/{id}/{subId}", {
            params: {
                path: {
                    id: id,
                    subId: subId,
                },
            },
            headers: serverHeaders,
        });

        if (error) {
            return { data: null, error };
        }

        return { data: data.data, error: null };
    },
    ["manga", "id"],
    { revalidate: 3600 }
);

export async function generateStaticParams(): Promise<
    { id: string; subId: string }[]
> {
    if (!process.env.API_KEY || process.env.DISABLE_STATIC_GENERATION === "1")
        return [];
    const { data, error } = await client.GET("/v2/manga/chapter/ids", {
        params: {
            query: {
                page: 1,
                pageSize: 50,
            },
        },
        headers: serverHeaders,
    });

    if (error || !data) {
        console.error(
            "Failed to fetch manga chapter IDs for static params:",
            error
        );
        return [];
    }

    return (data?.data.items ?? []).flatMap((manga) =>
        manga.chapterIds.map((subId) => ({
            id: manga.mangaId,
            subId: String(subId),
        }))
    );
}

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    const mangaParams = await params;
    const { data, error } = await getChapter(
        mangaParams.id,
        Number(mangaParams.subId)
    );

    if (error) {
        return {
            title: "Chapter Not Found",
            description: "The requested chapter could not be found.",
        };
    }

    const chapter = data;
    const title = `${chapter.mangaTitle} - ${chapter.title}`;
    const description = `Read ${chapter.mangaTitle} ${chapter.title}.`;
    let image = `/api/v1/manga/${mangaParams.id}/og`;
    if (process.env.NEXT_PUBLIC_HOST) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/api/v1/manga/${mangaParams.id}/og`;
    }

    return createMetadata({
        title: title,
        description: description,
        image: image,
        canonicalPath: `/manga/${mangaParams.id}`,
    });
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    const mangaParams = await params;
    const { data, error } = await getChapter(
        mangaParams.id,
        Number(mangaParams.subId)
    );

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <div className="bg-background text-foreground">
            <Reader chapter={data} />
            <div className="p-4">
                <MangaComments id={data.id} />
            </div>
        </div>
    );
}

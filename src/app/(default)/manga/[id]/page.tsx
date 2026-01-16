import { MangaDetailsComponent } from "@/components/manga-details";
import { MangaComments } from "@/components/manga-details/manga-comments";
import MangaDetailsSkeleton from "@/components/manga-details/skeleton";
import { client, serverHeaders } from "@/lib/api";
import {
    getAllMangaIds,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
}

export async function getManga(id: string) {
    "use cache";
    cacheLife("quarterHour");
    cacheTag("manga", `manga-${id}`);

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

export async function generateStaticParams() {
    let limit = undefined;
    if (STATIC_GENERATION_DISABLED) {
        limit = 1;
    }

    const mangaIds = await getAllMangaIds(limit);
    if (STATIC_GENERATION_DISABLED) {
        return [{ id: mangaIds[0] }];
    }

    return mangaIds.map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const { mangaData, error } = await getManga(params.id);

    if (error) {
        return {
            title: "Manga Not Found",
            description: "The requested manga could not be found.",
        };
    }

    const manga = mangaData;
    const description = truncate(manga.description, 300);

    return createMetadata({
        title: manga.title,
        description: description,
        image: createOgImage("manga", manga.id),
        canonicalPath: `/manga/${params.id}`,
    });
}

export default async function MangaPage(props: PageProps) {
    return (
        <div className="mx-auto p-4">
            <Suspense fallback={<MangaDetailsSkeleton />}>
                <MangaDetailsComponent params={props.params} />
            </Suspense>
            <Suspense fallback={null}>
                <MangaComments params={props.params} />
            </Suspense>
        </div>
    );
}

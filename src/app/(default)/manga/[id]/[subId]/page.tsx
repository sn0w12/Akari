import { Metadata } from "next";
import { Reader } from "@/components/manga-reader";
import { createMetadata, createOgImage } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { cacheLife, cacheTag } from "next/cache";
import {
    getAllChapterIds,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";

const getChapter = async (id: string, subId: number) => {
    "use cache";
    cacheLife("hours");
    cacheTag("manga-chapter", `manga-chapter-${id}-${subId}`);

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
};

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateStaticParams() {
    const limit = 1;

    const mangaIds = await getAllChapterIds(limit);
    if (STATIC_GENERATION_DISABLED) {
        return [
            {
                id: mangaIds[0].mangaId,
                subId: mangaIds[0].chapterIds[0].toString(),
            },
        ];
    }

    return mangaIds.flatMap(({ mangaId, chapterIds }) =>
        chapterIds.map((chapterId) => ({
            id: mangaId,
            subId: chapterId.toString(),
        }))
    );
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

    return createMetadata({
        title: title,
        description: description,
        image: createOgImage("manga", chapter.mangaId),
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

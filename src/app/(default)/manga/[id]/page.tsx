import { getManga, MangaDetailsComponent } from "@/components/manga-details";
import { MangaDetailsBody } from "@/components/manga-details/body";
import { MangaComments } from "@/components/manga-details/manga-comments";
import {
    getAllMangaIds,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";

export interface MangaPageProps {
    params: Promise<{ id: string }>;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
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

export async function generateMetadata(
    props: MangaPageProps,
): Promise<Metadata> {
    const params = await props.params;
    const { data, error } = await getManga(params.id);

    if (error || !data) {
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
        image: createOgImage("manga", manga.id),
        canonicalPath: `/manga/${params.id}`,
    });
}

export default async function MangaPage(props: MangaPageProps) {
    return (
        <div className="mx-auto p-4">
            <MangaDetailsComponent params={props.params} />
            <MangaDetailsBody params={props.params} />

            <Suspense fallback={null}>
                <MangaComments params={props.params} target="manga" />
            </Suspense>
        </div>
    );
}

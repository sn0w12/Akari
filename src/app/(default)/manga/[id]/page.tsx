import { getManga, MangaDetailsComponent } from "@/components/manga-details";
import { MangaDetailsBody } from "@/components/manga-details/body";
import { MangaComments } from "@/components/manga-details/manga-comments";
import {
    getAllMangaIds,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/seo";
import { Metadata } from "next";
import { Suspense } from "react";

export interface MangaPageProps {
    params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
    if (STATIC_GENERATION_DISABLED) {
        return [{ id: "737e7c9c-abac-4977-9c56-0a4ff26b295e" }];
    }

    const mangaIds = await getAllMangaIds();
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
    return createMetadata({
        title: manga.title,
        description: manga.description,
        image: createOgImage("manga", manga.id),
        canonicalPath: `/manga/${params.id}`,
    });
}

export default async function MangaPage(props: MangaPageProps) {
    return (
        <div className="w-full p-4">
            <MangaDetailsComponent params={props.params} />
            <MangaDetailsBody params={props.params} />

            <Suspense fallback={null}>
                <MangaComments params={props.params} target="manga" />
            </Suspense>
        </div>
    );
}

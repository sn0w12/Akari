import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/manga-details";
import { fetchMangaDetails } from "@/lib/manga/scraping";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { robots } from "@/lib/utils";
import { isApiErrorData } from "@/lib/api";

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
    const manga = await fetchMangaDetails(params.id);

    if (isApiErrorData(manga)) {
        return {
            title: "Manga not found",
            description: "The manga you are looking for could not be found.",
            robots: robots(),
            openGraph: {
                title: "Manga not found",
                description:
                    "The manga you are looking for could not be found.",
            },
            twitter: {
                card: "summary_large_image",
                title: "Manga not found",
                description:
                    "The manga you are looking for could not be found.",
            },
        };
    }

    const description = truncate(
        manga.malData?.description ?? manga.description,
        300
    );
    let image = `/api/v1/manga/${params.id}/og`;
    if (process.env.NEXT_PUBLIC_HOST) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/api/v1/manga/${params.id}/og`;
    }

    return {
        title: manga.name,
        description,
        robots: {
            index: false,
            follow: false,
        },
        openGraph: {
            title: manga.name,
            description,
            type: "website",
            siteName: "Akari Manga",
            images: image,
        },
        twitter: {
            card: "summary_large_image",
            title: manga.name,
            description,
            images: image,
        },
    };
}

export default async function MangaPage(props: PageProps) {
    const params = await props.params;
    return <MangaDetailsComponent id={params.id} />;
}

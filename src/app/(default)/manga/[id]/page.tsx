import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/MangaDetails";
import { fetchMangaDetails } from "@/lib/scraping";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const manga = await fetchMangaDetails(params.id);

    if ("error" in manga) {
        return {
            title: "Manga not found",
            description: "The manga you are looking for could not be found.",
            robots: {
                index: false,
                follow: false,
            },
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

    return {
        title: manga.name,
        description: manga.malData?.description ?? manga.description,
        robots: {
            index: false,
            follow: false,
        },
        openGraph: {
            title: manga.name,
            description: manga.malData?.description ?? manga.description,
            images: `/api/manga/${params.id}/og`,
        },
        twitter: {
            card: "summary_large_image",
            title: manga.name,
            description: manga.malData?.description ?? manga.description,
            images: `/api/manga/${params.id}/og`,
        },
    };
}

export default async function MangaPage(props: PageProps) {
    const params = await props.params;
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MangaDetailsComponent id={params.id} />
        </div>
    );
}

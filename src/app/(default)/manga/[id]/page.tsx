import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/MangaDetails";
import { fetchMangaDetails } from "@/lib/scraping";

interface PageProps {
    params: Promise<{ id: string }>;
}

function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1).trimEnd() + "…";
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

    const description = truncate(
        manga.malData?.description ?? manga.description,
        300,
    );
    let image = `/api/manga/${params.id}/og`;
    if (process.env.NEXT_HOST) {
        image = `https://${process.env.NEXT_HOST}/api/manga/${params.id}/og`;
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
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MangaDetailsComponent id={params.id} />
        </div>
    );
}

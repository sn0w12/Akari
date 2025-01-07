import { Metadata } from "next";
import { MangaDetailsComponent } from "@/components/MangaDetails";
import { scrapeMangaDetails } from "@/lib/mangaNato";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const manga = await scrapeMangaDetails(params.id);

    if ("result" in manga) {
        return {
            title: "Error",
            description: manga.data,
            robots: {
                index: false,
                follow: false,
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
            images: [manga.malData?.imageUrl ?? manga.imageUrl],
        },
        twitter: {
            card: "summary_large_image",
            title: manga.name,
            description: manga.malData?.description ?? manga.description,
            images: [manga.malData?.imageUrl ?? manga.imageUrl],
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

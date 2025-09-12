import { Metadata } from "next";
import ChapterReader from "@/components/MangaReader";
import { fetchChapterData } from "@/lib/scraping";
import { unstable_cacheLife as cacheLife } from "next/cache";
import { robots } from "@/lib/utils";

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    "use cache";
    cacheLife("weeks");

    const mangaParams = await params;
    const chapter = await fetchChapterData(mangaParams.id, mangaParams.subId);

    if ("result" in chapter) {
        throw new Error(chapter.data);
    }

    const title = `${chapter.title} - ${chapter.chapter}`;
    const description = `Read ${chapter.title} ${chapter.chapter}`;
    let image = `/api/manga/${mangaParams.id}/og`;
    if (process.env.NEXT_HOST) {
        image = `https://${process.env.NEXT_HOST}/api/manga/${mangaParams.id}/og`;
    }

    return {
        title,
        description,
        robots: robots(),
        openGraph: {
            title,
            description,
            type: "website",
            siteName: "Akari Manga",
            images: image,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image,
        },
    };
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    const mangaParams = await params;
    return (
        <div className="bg-background text-foreground">
            <ChapterReader id={mangaParams.id} subId={mangaParams.subId} />
        </div>
    );
}

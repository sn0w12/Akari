import { Metadata } from "next";
import ChapterReader from "@/components/manga-reader";
import { fetchChapterData } from "@/lib/manga/scraping";
import { cacheLife } from "next/cache";
import { robots } from "@/lib/utils";
import { isApiErrorData } from "@/lib/api";

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

    if (isApiErrorData(chapter)) {
        throw new Error(chapter.message);
    }

    const title = `${chapter.title} - ${chapter.chapter}`;
    const description = `Read ${chapter.title} ${chapter.chapter}`;
    let image = `/api/v1/manga/${mangaParams.id}/og`;
    if (process.env.NEXT_PUBLIC_HOST) {
        image = `https://${process.env.NEXT_PUBLIC_HOST}/api/v1/manga/${mangaParams.id}/og`;
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

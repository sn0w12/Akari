import { Metadata } from "next";
import ChapterReader from "@/components/MangaReader";
import { Chapter } from "@/app/api/interfaces";
import { scrapeMangaChapter } from "@/lib/mangaNato";

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    const mangaParams = await params;
    const chapter: Chapter = await scrapeMangaChapter(
        mangaParams.id,
        mangaParams.subId,
    );

    const title = `${chapter.title} - Chapter ${chapter.chapter}`;
    const description = `Read ${chapter.title} Chapter ${chapter.chapter}`;

    return {
        title,
        description,
        robots: {
            index: false,
            follow: false,
        },
        openGraph: {
            title,
            description,
            type: "website",
            siteName: "Manga Reader",
            images: chapter.images?.[0],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: chapter.images?.[0],
        },
    };
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    const mangaParams = await params;
    return (
        <div className="min-h-dvh bg-background text-foreground">
            <ChapterReader id={mangaParams.id} subId={mangaParams.subId} />
        </div>
    );
}

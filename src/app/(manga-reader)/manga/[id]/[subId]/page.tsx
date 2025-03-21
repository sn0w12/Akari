import { Metadata } from "next";
import ChapterReader, { fetchChapter } from "@/components/MangaReader";
import { Chapter } from "@/app/api/interfaces";

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    const mangaParams = await params;
    const chapter: Chapter = await fetchChapter(
        mangaParams.id,
        mangaParams.subId,
    );

    const title = `${chapter.title} - ${chapter.chapter}`;
    const description = `Read ${chapter.title} ${chapter.chapter}`;

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

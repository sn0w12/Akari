import { Metadata } from "next";
import ChapterReader from "@/components/MangaReader";
import { Chapter } from "@/app/api/interfaces";
import { fetchChapterData } from "@/lib/scraping";

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export async function generateMetadata({
    params,
}: MangaReaderProps): Promise<Metadata> {
    const mangaParams = await params;
    const chapter = await fetchChapterData(mangaParams.id, mangaParams.subId);

    if ("result" in chapter) {
        throw new Error(chapter.data);
    }

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
        <div className="bg-background text-foreground">
            <ChapterReader id={mangaParams.id} subId={mangaParams.subId} />
        </div>
    );
}

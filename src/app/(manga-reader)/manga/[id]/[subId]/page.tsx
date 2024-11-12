import ChapterReader from "@/components/MangaReader";

interface MangaReaderProps {
    params: Promise<{ id: string; subId: string }>;
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    const mangaParams = await params;
    return (
        <div className="min-h-dvh bg-background text-foreground">
            <ChapterReader id={mangaParams.id} subId={mangaParams.subId} />
        </div>
    );
}

import ChapterReader from "@/components/MangaReader";

interface MangaReaderProps {
    params: {
        id: string;
        subId: string;
    };
}

export default async function MangaReaderPage({ params }: MangaReaderProps) {
    return (
        <div className="min-h-dvh bg-background text-foreground">
            <ChapterReader id={params.id} subId={params.subId} />
        </div>
    );
}

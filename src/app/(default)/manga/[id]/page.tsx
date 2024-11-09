import { MangaDetailsComponent } from "@/components/MangaDetails";

interface PageProps {
    params: { id: string };
}

export default function MangaPage({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <MangaDetailsComponent id={params.id} />
        </div>
    );
}

import { Suspense } from "react";
import { MangaDetailsComponent } from "@/components/MangaDetails";
import MangaDetailsSkeleton from "@/components/ui/MangaDetails/mangaDetailsSkeleton";

interface PageProps {
    params: { id: string };
}

export default function MangaPage({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<MangaDetailsSkeleton />}>
                <MangaDetailsComponent id={params.id} />
            </Suspense>
        </div>
    );
}

import { Suspense } from "react";
import { MangaDetailsComponent } from "@/components/MangaDetails";
import FallbackPage from "@/components/FallbackPage";

interface PageProps {
    params: { id: string };
}

export default function MangaPage({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<FallbackPage />}>
                <MangaDetailsComponent id={params.id} />
            </Suspense>
        </div>
    );
}

import { Suspense } from "react";
import { MangaDetailsComponent } from "@/components/MangaDetails";

interface PageProps {
    params: { id: string };
}

export default function MangaPage({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense
                fallback={
                    <div className="container mx-auto px-4 py-8">
                        Loading...
                    </div>
                }
            >
                <MangaDetailsComponent id={params.id} />
            </Suspense>
        </div>
    );
}

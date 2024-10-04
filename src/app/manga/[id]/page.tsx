import { Suspense } from "react";
import { MangaDetailsComponent } from "@/components/MangaDetails";
import { HeaderComponent } from "@/components/Header";

interface PageProps {
    params: { id: string };
}

export default function MangaPage({ params }: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeaderComponent />
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

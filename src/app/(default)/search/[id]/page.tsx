import { Suspense } from "react";
import { MangaDetailsComponent } from "@/components/MangaDetails";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function SearchPage(props: PageProps) {
    const params = await props.params;
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

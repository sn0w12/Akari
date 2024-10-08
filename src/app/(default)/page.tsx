import MangaReaderHome from "@/components/MangaReaderHome";
import { HeaderComponent } from "@/components/Header";
import { Suspense } from "react";
import FallbackPage from "@/components/FallbackPage";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <HeaderComponent />
            <Suspense fallback={<FallbackPage />}>
                <MangaReaderHome />
            </Suspense>
        </div>
    );
}

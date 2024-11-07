import MangaReaderHome from "@/components/Home";
import { Suspense } from "react";
import FallbackPage from "@/components/FallbackPage";

interface HomeProps {
    searchParams: {
        page: string;
        [key: string]: string | string[] | undefined;
    };
}

export default function Home({ searchParams }: HomeProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Suspense fallback={<FallbackPage />}>
                <MangaReaderHome searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

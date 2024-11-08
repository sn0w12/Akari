import MangaReaderHome from "@/components/Home";
import { Suspense } from "react";
import HomeSkeleton from "@/components/ui/Home/HomeSkeleton";
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
            <Suspense
                fallback={
                    <HomeSkeleton
                        currentPage={Number(searchParams.page) || 1}
                    />
                }
            >
                <MangaReaderHome searchParams={searchParams} />
            </Suspense>
        </div>
    );
}

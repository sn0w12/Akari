import MangaReaderHome from "@/components/Home";
import { Suspense } from "react";
import HomeSkeleton from "@/components/ui/Home/HomeSkeleton";

interface HomeProps {
    searchParams: Promise<{
        page: string;
        [key: string]: string | string[] | undefined;
    }>;
}

export default async function Home(props: HomeProps) {
    const searchParams = await props.searchParams;
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

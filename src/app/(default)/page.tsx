import { GridBodySkeleton } from "@/components/grid-page";
import { InstallPrompt } from "@/components/home/install-prompt";
import { NotificationPrompt } from "@/components/home/notification-prompt";
import {
    PopularManga,
    PopularMangaSkeleton,
} from "@/components/home/popular-manga";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { PromptStack } from "@/components/ui/prompt-stack";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { Suspense } from "react";
import { getLatestData } from "./latest/page";
import { getPopularData } from "./popular/page";

export const metadata: Metadata = createMetadata({
    title: "Home",
    description: "Read manga for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/",
});

export default async function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-2 pb-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Popular Manga</h2>
                    <Suspense fallback={<PopularMangaSkeleton />}>
                        <HomePopular />
                    </Suspense>
                </div>
                <h2 className="text-3xl font-bold mb-2">Latest Releases</h2>
                <Suspense fallback={<GridBodySkeleton />}>
                    <HomeLatest />
                </Suspense>
            </div>
            <PromptStack>
                <InstallPrompt />
                <NotificationPrompt />
            </PromptStack>
        </div>
    );
}

async function HomePopular() {
    const { data, error } = await getPopularData(1, 7);

    if (error || !data) {
        return null;
    }

    return <PopularManga manga={data.data.items} />;
}

async function HomeLatest() {
    const { data, error } = await getLatestData(1);

    if (error || !data) {
        return null;
    }

    return (
        <>
            <MangaGrid mangaList={data.data.items} />
            <ServerPagination
                currentPage={1}
                href="./latest"
                totalPages={data.data.totalPages}
                className="my-4"
            />
        </>
    );
}

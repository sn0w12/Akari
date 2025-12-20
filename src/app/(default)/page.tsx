import MangaReaderHome from "@/components/home";
import { client } from "@/lib/api";
import { createMetadata } from "@/lib/utils";
import { Metadata } from "next";
import ErrorPage from "@/components/error-page";
import { serverHeaders } from "@/lib/api";
import { unstable_cache } from "next/cache";

export const metadata: Metadata = createMetadata({
    title: "Home",
    description: "Read manga for free on Akari.",
    image: "/og/akari.webp",
    canonicalPath: "/",
});

const getHomeData = unstable_cache(
    async () => {
        const [latestResponse, popularResponse] = await Promise.all([
            client.GET("/v2/manga/list", {
                params: {
                    query: {
                        page: 1,
                        pageSize: 24,
                    },
                },
                headers: serverHeaders,
            }),
            client.GET("/v2/manga/list/popular", {
                params: {
                    query: {
                        pageSize: 24,
                        days: 30,
                    },
                },
                headers: serverHeaders,
            }),
        ]);

        return {
            latestData: latestResponse.data,
            latestError: latestResponse.error,
            popularData: popularResponse.data,
            popularError: popularResponse.error,
        };
    },
    ["home-data"],
    { revalidate: 600, tags: ["home"] }
);

export default async function Home() {
    const { latestData, latestError, popularData, popularError } =
        await getHomeData();

    if (latestError || !latestData) {
        return (
            <ErrorPage title="Failed to load manga list" error={latestError} />
        );
    }

    if (popularError || !popularData) {
        return (
            <ErrorPage
                title="Failed to load popular manga"
                error={popularError}
            />
        );
    }

    return (
        <MangaReaderHome
            latest={latestData.data.items}
            popular={popularData.data.items}
            totalPages={latestData.data.totalPages}
        />
    );
}

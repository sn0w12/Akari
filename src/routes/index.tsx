import { createFileRoute } from "@tanstack/react-router";
import MangaReaderHome from "@/components/home";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";

async function getHomeData() {
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
}

export const Route = createFileRoute("/")({
    loader: async () => {
        const data = await getHomeData();
        return data;
    },
    head: () => ({
        meta: [
            {
                title: "Home - Akari",
            },
            {
                name: "description",
                content: "Akari Manga - Read manga for free on Akari.",
            },
            {
                property: "og:title",
                content: "Home",
            },
            {
                property: "og:description",
                content: "Akari Manga - Read manga for free on Akari.",
            },
            {
                property: "og:image",
                content: "/og/akari.webp",
            },
        ],
    }),
    component: HomePage,
});

function HomePage() {
    const { latestData, latestError, popularData, popularError } = Route.useLoaderData();

    if (latestError || !latestData) {
        return <ErrorPage title="Failed to load manga list" error={latestError} />;
    }

    if (popularError || !popularData) {
        return <ErrorPage title="Failed to load popular manga" error={popularError} />;
    }

    return (
        <MangaReaderHome
            latest={latestData.data.items}
            popular={popularData.data.items}
            totalPages={latestData.data.totalPages}
        />
    );
}

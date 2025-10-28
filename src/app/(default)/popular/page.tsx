import { Metadata } from "next";
import { getBaseUrl } from "@/lib/api/base-url";
import { robots } from "@/lib/utils";
import { client, serverHeaders } from "@/lib/api";
import ErrorPage from "@/components/error-page";
import GridPage from "@/components/grid-page";

interface PageProps {
    searchParams: Promise<{
        page: string;
    }>;
}

const description = `View all popular manga`;
const ogImage = `${getBaseUrl()}/og/popular.webp`;
export const metadata: Metadata = {
    title: "Popular Manga",
    description: description,
    robots: robots(),
    openGraph: {
        title: "Popular Manga",
        description: description,
        images: ogImage,
    },
    twitter: {
        title: "Popular Manga",
        description: description,
        images: ogImage,
    },
};

export default async function Popular(props: PageProps) {
    const searchParams = await props.searchParams;
    const { data, error } = await client.GET("/v2/manga/list/popular", {
        params: {
            query: {
                offset: Number(searchParams.page) || 1,
                pageSize: 24,
                days: 30,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return <ErrorPage error={error} />;
    }

    return (
        <GridPage
            title={"Popular"}
            mangaList={data.data.items}
            currentPage={data.data.currentPage}
            totalPages={data.data.totalPages}
        />
    );
}

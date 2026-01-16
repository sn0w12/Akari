import ErrorPage from "@/components/error-page";
import { GridBodySkeleton } from "@/components/grid-page";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { client, serverHeaders } from "@/lib/api";
import {
    getAllAuthors,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
        page: string;
    }>;
}

export async function generateStaticParams() {
    let limit = undefined;
    if (STATIC_GENERATION_DISABLED) {
        limit = 1;
    }

    const authorIds = await getAllAuthors(limit);
    if (STATIC_GENERATION_DISABLED) {
        return [{ id: authorIds[0] }];
    }

    return authorIds.map((id) => ({ id }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const name = params.id.replaceAll("-", " ");
    const description = `View all manga by ${name} on Akari for free.`;

    return createMetadata({
        title: name,
        description: description,
        image: createOgImage("author", params.id),
        canonicalPath: `/author/${params.id}`,
    });
}

async function getAuthor(name: string, page: number) {
    "use cache";
    cacheLife("hours");
    cacheTag("author", `author-${name}`);

    const { data, error } = await client.GET("/v2/author/{name}", {
        params: {
            path: {
                name,
            },
            query: {
                page: page,
                pageSize: 24,
            },
        },
        headers: serverHeaders,
    });

    if (error) {
        return { data: null, error };
    }

    return { data, error: null };
}

export default async function AuthorPage(props: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground mx-auto px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <Suspense fallback={<AuthorHeaderFallback />}>
                    <AuthorHeader {...props} />
                </Suspense>
            </div>

            <Suspense fallback={<GridBodySkeleton pageSize={6} />}>
                <AuthorBody {...props} />
            </Suspense>
        </div>
    );
}

async function AuthorHeader(props: PageProps) {
    const params = await props.params;
    const title = decodeURIComponent(params.id).replaceAll("-", " ");

    return <h2 className="text-3xl font-bold mb-2">{title}</h2>;
}

async function AuthorHeaderFallback() {
    return <Skeleton className="h-[36px] mb-2 w-96" />;
}

async function AuthorBody(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const title = decodeURIComponent(params.id).replaceAll("-", " ");

    const { data, error } = await getAuthor(
        title,
        Number(searchParams.page) || 1,
    );

    if (error || !data) {
        return <ErrorPage error={error} />;
    }

    return (
        <>
            <MangaGrid mangaList={data.data.items} />
            <ServerPagination
                currentPage={data.data.currentPage}
                totalPages={data.data.totalPages}
                className="mt-4"
            />
        </>
    );
}

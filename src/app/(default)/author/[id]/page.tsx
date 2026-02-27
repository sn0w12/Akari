import ErrorPage from "@/components/error-page";
import { MangaGrid } from "@/components/manga/manga-grid";
import { ServerPagination } from "@/components/ui/pagination/server-pagination";
import { client, serverHeaders } from "@/lib/api";
import {
    getAllAuthors,
    STATIC_GENERATION_DISABLED,
} from "@/lib/api/pre-render";
import { createMetadata, createOgImage } from "@/lib/utils";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";

export interface AuthorPageProps {
    params: Promise<{ id: string; page?: string }>;
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

export async function generateMetadata(
    props: AuthorPageProps,
): Promise<Metadata> {
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

export async function getAuthor(name: string, page: number) {
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

export default async function AuthorPage(props: AuthorPageProps) {
    return (
        <div className="flex-1 px-4 pt-2 pb-4">
            <div className="flex gap-4">
                <AuthorHeader params={props.params} />
            </div>
            <AuthorBody params={props.params} />
        </div>
    );
}

export async function AuthorHeader({ params }: AuthorPageProps) {
    const { id } = await params;
    const title = decodeURIComponent(id).replaceAll("-", " ");

    return <h2 className="text-3xl font-bold mb-2">{title}</h2>;
}

export async function AuthorBody({ params }: AuthorPageProps) {
    const { id, page } = await params;
    const title = decodeURIComponent(id).replaceAll("-", " ");

    const { data, error } = await getAuthor(title, Number(page) || 1);

    if (error || !data) {
        return <ErrorPage error={error} />;
    }

    return (
        <>
            <MangaGrid mangaList={data.data.items} priority={4} />
            <ServerPagination
                currentPage={data.data.currentPage}
                totalPages={data.data.totalPages}
                className="mt-4"
                href={`/author/${id}`}
            />
        </>
    );
}

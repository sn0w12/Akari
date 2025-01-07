import { SortSelect } from "./ui/SortSelect";
import nextBase64 from "next-base64";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { MangaCard } from "./ui/Home/MangaCard";
import { SmallManga } from "@/app/api/interfaces";
import Head from "next/head";
import { fetchMangaAuthor } from "@/app/api/author/[id]/route";

interface PageProps {
    params: { id: string };
    searchParams: { page?: string; sort?: string };
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    let mangaList: SmallManga[] = [];
    let totalPages = 1;
    let error: string | null = null;

    try {
        const data = await fetchMangaAuthor(
            params.id,
            currentSort,
            Number(currentPage),
        );

        if ("result" in data) {
            error = String(data.data);
        } else {
            mangaList = data.mangaList;
            totalPages = data.metaData.totalPages;
        }
    } catch (err) {
        error = err instanceof Error ? err.message : String(err);
    }

    return (
        <>
            <Head>
                <link
                    rel="canonical"
                    href={`/author/${params.id}${currentPage > 1 ? `?page=${currentPage}` : ""}`}
                />
                {currentPage > 1 && (
                    <link
                        rel="prev"
                        href={`/author/${params.id}${currentPage > 2 ? `?page=${currentPage - 1}` : ""}`}
                    />
                )}
                {currentPage < totalPages && (
                    <link
                        rel="next"
                        href={`/author/${params.id}?page=${currentPage + 1}`}
                    />
                )}
            </Head>
            <div className="min-h-screen bg-background text-foreground">
                <main className="container mx-auto px-4 py-8">
                    <div className="flex gap-4">
                        <h2 className={`text-3xl font-bold mb-6`}>
                            {nextBase64
                                .decode(params.id)
                                .replaceAll("_", " ")
                                .replaceAll("|", " ")
                                .split(" ")
                                .map(
                                    (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1),
                                )
                                .join(" ")}
                        </h2>
                        <SortSelect currentSort={currentSort} />
                    </div>

                    {error && <ErrorComponent message={error} />}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {mangaList.map((manga) => (
                            <MangaCard key={manga.id} manga={manga} />
                        ))}
                    </div>
                </main>

                {!error && (
                    <PaginationElement
                        currentPage={currentPage}
                        totalPages={totalPages}
                        searchParams={[{ key: "sort", value: currentSort }]}
                    />
                )}
            </div>
        </>
    );
}

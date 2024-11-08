import { Card, CardContent } from "@/components/ui/card";
import { SortSelect } from "./ui/SortSelect";
import nextBase64 from "next-base64";
import Link from "next/link";
import Image from "next/image";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import ErrorComponent from "./ui/error";
import { getProductionUrl } from "@/app/api/baseUrl";

interface Manga {
    id: string;
    image: string;
    title: string;
    chapter: string;
    chapterUrl: string;
    description: string;
    rating: string;
    views: string;
    date: string;
    author: string;
}

interface MangaListResponse {
    mangaList: Manga[];
    popular: Manga[];
    metaData: {
        totalStories: number;
        totalPages: number;
    };
}

interface PageProps {
    params: { id: string };
    searchParams: { page?: string; sort?: string };
}

async function getMangaList(authorId: string, page: number, sort: string) {
    try {
        const response = await fetch(
            `${getProductionUrl()}/api/author/${authorId}?orderBy=${sort}&page=${page}`,
            { cache: "no-store" },
        );

        if (!response.ok) {
            throw new Error("Failed to fetch manga list");
        }

        return (await response.json()) as MangaListResponse;
    } catch (error) {
        throw new Error(`Error fetching manga list: ${error}`);
    }
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
    const currentPage = Number(searchParams.page) || 1;
    const currentSort = searchParams.sort || "latest";

    let mangaList: Manga[] = [];
    let totalPages = 1;
    let error = null;

    try {
        const data = await getMangaList(params.id, currentPage, currentSort);
        mangaList = data.mangaList;
        totalPages = data.metaData.totalPages;
    } catch (err) {
        error = `${err}`;
    }

    return (
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
                        <Link
                            href={`/manga/${manga.id}`}
                            key={manga.id}
                            className="block"
                        >
                            <Card className="group relative overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
                                <CardContent className="p-0">
                                    <Image
                                        src={manga.image}
                                        alt={manga.title}
                                        width={250}
                                        height={350}
                                        className="w-full h-auto object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-0 transition-transform duration-300 ease-in-out">
                                            <h3 className="font-bold text-sm mb-1 opacity-100 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                {manga.title}
                                            </h3>
                                            <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                {`Author${
                                                    manga.author.split(",")
                                                        .length > 1
                                                        ? "s"
                                                        : ""
                                                }: `}
                                                {manga.author
                                                    .split(",")
                                                    .map((author) =>
                                                        author.trim(),
                                                    )
                                                    .join(" | ")}
                                            </p>
                                            <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                Chapter: {manga.chapter}
                                            </p>
                                            <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                                                Views: {manga.views}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            <PaginationElement
                currentPage={currentPage}
                totalPages={totalPages}
            />
        </div>
    );
}

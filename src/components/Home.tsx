import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import ErrorComponent from "./ui/error";
import { PaginationElement } from "@/components/ui/Pagination/ServerPaginationElement";
import { getProductionUrl } from "@/app/api/baseUrl";
import { PopularManga } from "./ui/Home/PopularManga";

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

async function getMangaData(page: number): Promise<MangaListResponse> {
    const baseUrl = getProductionUrl();
    const url = `${baseUrl}/api/manga-list/latest?page=${page}`;

    const res = await fetch(url, {
        next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Fetch error details:", {
            error: errorText,
            status: res.status,
            url,
        });
        throw new Error(
            `Failed to fetch manga data: ${res.status} ${res.statusText}`,
        );
    }

    return res.json();
}

export default async function MangaReaderHome({
    searchParams,
}: {
    searchParams: { page: string };
}) {
    const currentPage = Number(searchParams.page) || 1;

    let mangaData: MangaListResponse;
    try {
        mangaData = await getMangaData(currentPage);
    } catch (error) {
        return <ErrorComponent message="Failed to load manga data" />;
    }

    const { mangaList, popular, metaData } = mangaData;
    const totalPages = metaData.totalPages;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container mx-auto px-4 py-8">
                {currentPage === 1 && (
                    <div>
                        <h2 className="text-3xl font-bold mb-6">
                            Popular Manga
                        </h2>
                        <PopularManga mangas={popular.slice(0, -1)} />
                    </div>
                )}

                <h2
                    className={`text-3xl font-bold mb-6 ${currentPage === 1 ? "mt-6" : ""}`}
                >
                    Latest Releases
                </h2>
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
                                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                            <h3 className="font-bold text-sm mb-1">
                                                {manga.title}
                                            </h3>
                                            <p className="text-xs">
                                                {`Author${manga.author.split(",").length > 1 ? "s" : ""}: `}
                                                {manga.author
                                                    .split(",")
                                                    .map((author) =>
                                                        author.trim(),
                                                    )
                                                    .join(" | ")}
                                            </p>
                                            <p className="text-xs">
                                                Chapter: {manga.chapter}
                                            </p>
                                            <p className="text-xs">
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

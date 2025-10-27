import { ServerPagination } from "./ui/pagination/server-pagination";
import { MangaGrid } from "./manga/manga-grid";

interface PageProps {
    title: string;
    mangaList: components["schemas"]["MangaResponse"][];
    currentPage: number;
    totalPages: number;
    currentSort?: string;
}

export default async function GridPage({
    title,
    mangaList,
    currentPage,
    totalPages,
    currentSort,
}: PageProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-1 pb-4">
                <div className="flex gap-4">
                    <h2 className={`text-3xl font-bold mb-6`}>{title}</h2>
                </div>

                <MangaGrid mangaList={mangaList} />
            </div>

            <ServerPagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParams={[{ key: "sort", value: currentSort || "" }]}
                className="mb-4"
            />
        </div>
    );
}

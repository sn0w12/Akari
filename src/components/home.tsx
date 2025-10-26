import { ServerPagination } from "./ui/pagination/server-pagination";
import { PopularManga } from "./home/popular-manga";
import { MangaGrid } from "./manga/manga-grid";

export default async function MangaReaderHome({
    data,
}: {
    data: components["schemas"]["MangaListResponseApiResponse"];
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-1 pb-4">
                <h2
                    className={`text-3xl font-bold mb-6 ${
                        data.data.currentPage === 1 ? "mt-6" : ""
                    }`}
                >
                    Latest Releases
                </h2>
                <MangaGrid mangaList={data.data.items || []} />
            </div>
            <ServerPagination
                currentPage={data.data.currentPage || 1}
                totalPages={data.data.totalPages || 1}
                className="mb-4"
            />
        </div>
    );
}

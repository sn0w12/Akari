import { ServerPagination } from "./ui/pagination/server-pagination";
import { PopularManga } from "./home/popular-manga";
import { MangaGrid } from "./manga/manga-grid";
import { InstallPrompt } from "./home/install-prompt";

export default async function MangaReaderHome({
    latest,
    popular,
    totalPages,
}: {
    latest: components["schemas"]["MangaResponse"][];
    popular: components["schemas"]["MangaResponse"][];
    totalPages: number;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="mx-auto px-4 pt-2 pb-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Popular Manga</h2>
                    <PopularManga manga={popular} />
                </div>
                <h2 className={`text-3xl font-bold mb-2`}>Latest Releases</h2>
                <MangaGrid mangaList={latest} />
                <ServerPagination
                    currentPage={1}
                    href="./latest"
                    totalPages={totalPages}
                    className="my-4"
                />
            </div>
            <InstallPrompt />
        </div>
    );
}

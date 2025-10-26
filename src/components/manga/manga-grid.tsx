import { MangaCard } from "./manga-card";
interface MangaGridProps {
    mangaList: components["schemas"]["MangaResponse"][];
}

export function MangaGrid({ mangaList }: MangaGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
            ))}
        </div>
    );
}

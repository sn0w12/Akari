import { GRID_CLASS } from "../grid-page";
import { MangaCard } from "./manga-card";
interface MangaGridProps {
    mangaList: components["schemas"]["MangaResponse"][];
}

export function MangaGrid({ mangaList }: MangaGridProps) {
    return (
        <div className={GRID_CLASS}>
            {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
            ))}
        </div>
    );
}

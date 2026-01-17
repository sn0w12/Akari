import { cn } from "@/lib/utils";
import { GRID_CLASS } from "../grid-page";
import { MangaCard } from "./manga-card";
interface MangaGridProps {
    mangaList: components["schemas"]["MangaResponse"][];
    className?: string;
}

export function MangaGrid({ mangaList, className }: MangaGridProps) {
    return (
        <div className={cn(GRID_CLASS, className)}>
            {mangaList.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
            ))}
        </div>
    );
}

import { cn } from "@/lib/utils";
import { GRID_CLASS } from "../grid-page";
import { MangaCard } from "./manga-card";
interface MangaGridProps {
    mangaList: components["schemas"]["MangaResponse"][];
    priority?: number;
    className?: string;
}

export function MangaGrid({ mangaList, priority, className }: MangaGridProps) {
    return (
        <div className={cn(GRID_CLASS, className)}>
            {mangaList.map((manga, index) => (
                <MangaCard
                    key={manga.id}
                    manga={manga}
                    priority={index < (priority ?? 0)}
                />
            ))}
        </div>
    );
}

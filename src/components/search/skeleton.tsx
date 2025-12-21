import { Input } from "@/components/ui/input";
import MangaCardSkeleton from "../manga/manga-card-skeleton";
import { GRID_CLASS } from "../grid-page";

export default function SearchPageSkeleton() {
    return (
        <div className="container mx-auto px-4 pt-4">
            <Input
                type="search"
                placeholder="Search manga..."
                className="w-full p-2 mb-4"
                disabled
            />
            <div className={`${GRID_CLASS} pt-4`}>
                {Array.from({ length: 24 }).map((_, i) => (
                    <MangaCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

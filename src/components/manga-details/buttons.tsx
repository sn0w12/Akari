import { ListSelector } from "../list/list-selector";
import { BookmarkButton } from "./bookmark-button";

interface ButtonsProps {
    manga: components["schemas"]["MangaResponse"];
}

export default function Buttons({ manga }: ButtonsProps) {
    return (
        <div className="flex flex-col xl:flex-row gap-2">
            <BookmarkButton
                mangaId={manga.id}
                size="lg"
                className="w-full xl:flex-1"
            />
            <ListSelector mangaId={manga.id} />
        </div>
    );
}

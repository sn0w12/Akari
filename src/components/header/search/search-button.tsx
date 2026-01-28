import { ButtonLink } from "@/components/ui/button-link";
import { Search } from "lucide-react";

export default function SearchButton() {
    return (
        <ButtonLink
            href="/search"
            variant="ghost"
            size="icon"
            className="md:hidden border touch-manipulation size-10"
            aria-label="Search Manga"
        >
            <Search className="size-5" />
        </ButtonLink>
    );
}

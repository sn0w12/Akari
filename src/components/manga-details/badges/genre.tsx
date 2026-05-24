import { genreSeverityRank } from "@/lib/api/search";
import { Link } from "@tanstack/react-router";
import { Badge, BadgeVariantProps } from "../../ui/badge";

const genreVariantBySeverity: Record<number, BadgeVariantProps["variant"]> = {
    0: "secondary",
    1: "warning",
    2: "destructive",
};

export function GenreBadge({
    genre,
    size,
}: {
    genre: string;
    size?: BadgeVariantProps["size"];
}) {
    const severity =
        genreSeverityRank[genre.toLowerCase().replaceAll(" ", "_")] ?? 0;

    return (
        <Badge
            variant={genreVariantBySeverity[severity]}
            size={size}
            render={
                <Link
                    to="/genre/$genreId"
                    params={{
                        genreId: encodeURIComponent(genre.replaceAll(" ", "-")),
                    }}
                />
            }
        >
            {genre}
        </Badge>
    );
}

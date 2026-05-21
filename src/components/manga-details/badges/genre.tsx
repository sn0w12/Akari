import { Link } from "@tanstack/react-router";
import { Badge, BadgeVariantProps } from "../../ui/badge";

const genreVariantMap: Record<string, BadgeVariantProps["variant"]> = {
    adult: "destructive",
    hentai: "destructive",
    mature: "destructive",
    shoujo_ai: "destructive",
    shounen_ai: "destructive",
    smut: "destructive",
    ecchi: "warning",
};

export function GenreBadge({
    genre,
    size,
}: {
    genre: string;
    size?: BadgeVariantProps["size"];
}) {
    return (
        <Badge
            variant={
                genreVariantMap[genre.toLowerCase().replaceAll(" ", "_")] ||
                "secondary"
            }
            size={size}
            render={
                <Link
                    key={genre}
                    to="/genre/$id"
                    params={{
                        id: encodeURIComponent(genre.replaceAll(" ", "-")),
                    }}
                />
            }
        >
            {genre}
        </Badge>
    );
}

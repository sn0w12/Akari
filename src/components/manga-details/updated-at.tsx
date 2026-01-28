"use client";

import { formatRelativeDate } from "@/lib/utils";
import { Badge } from "../ui/badge";

export function MangaUpdatedAt({ updatedAt }: { updatedAt: string }) {
    return (
        <Badge className="hover:bg-primary">
            {formatRelativeDate(updatedAt)}
        </Badge>
    );
}

export function MangaUpdatedAtFallback() {
    return <Badge className="hover:bg-primary" />;
}

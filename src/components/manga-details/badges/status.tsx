import { capitalize } from "@/lib/utils";
import { Badge, BadgeVariantProps } from "../../ui/badge";

const statusVariantMap: Record<string, BadgeVariantProps["variant"]> = {
    ongoing: "success",
    completed: "info",
    hiatus: "warning",
    cancelled: "destructive",
};

export function StatusBadge({
    status,
    size,
}: {
    status: string;
    size?: BadgeVariantProps["size"];
}) {
    return (
        <Badge
            variant={statusVariantMap[status.toLowerCase()] || "outline"}
            size={size}
        >
            {capitalize(status)}
        </Badge>
    );
}

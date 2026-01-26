import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const imgSize = "w-full h-auto aspect-[2/3]";
export default function MangaCardSkeleton({
    className,
}: {
    className?: string;
}) {
    return (
        <Card className={cn("group relative overflow-hidden p-0", className)}>
            <CardContent className="p-0">
                <Skeleton className={imgSize} />
            </CardContent>
        </Card>
    );
}

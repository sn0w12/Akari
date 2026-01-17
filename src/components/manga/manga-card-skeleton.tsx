import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const imgSize = "w-full h-auto aspect-[2/3]";
export default function MangaCardSkeleton() {
    return (
        <Card className="group relative overflow-hidden p-0">
            <CardContent className="p-0">
                <Skeleton className={imgSize} />
            </CardContent>
        </Card>
    );
}

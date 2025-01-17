import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const imgSize = "w-full h-auto aspect-[8.5/12] xl:h-[260px] 2xl:h-[340px]";
export default function MangaCardSkeleton() {
    return (
        <Card className="group relative overflow-hidden">
            <CardContent className="p-0">
                <Skeleton className={imgSize} />
            </CardContent>
        </Card>
    );
}

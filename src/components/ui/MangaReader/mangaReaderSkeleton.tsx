import { Skeleton } from "@/components/ui/skeleton";

export default function MangaReaderSkeleton() {
    return (
        <div className="flex flex-col justify-center items-center h-dvh w-screen bg-transparent">
            <Skeleton className="relative max-h-dvh w-full h-auto md:h-full md:w-auto aspect-[2.8/4]" />
        </div>
    );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function MangaReaderSkeleton() {
    return (
        <div
            className="flex flex-col justify-center items-center w-full bg-transparent"
            style={{ height: "calc(100dvh - var(--reader-offset))" }}
        >
            <Skeleton className="relative h-full w-full h-auto md:h-full md:w-auto aspect-[1/1.41421356237] rounded-none" />
        </div>
    );
}

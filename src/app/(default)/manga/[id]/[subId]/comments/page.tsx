import ErrorPage from "@/components/error-page";
import { getManga } from "@/components/manga-details";
import { MangaComments } from "@/components/manga-details/manga-comments";
import { Skeleton } from "@/components/ui/skeleton";
import { generateSizes } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface MangaReaderCommentsProps {
    params: Promise<{ id: string; subId: string }>;
}

export default async function MangaReaderComments({
    params,
}: MangaReaderCommentsProps) {
    return (
        <div className="bg-background text-foreground p-4">
            <div className="flex flex-col gap-4">
                {/* Manga Header */}
                <Suspense fallback={<MangaCommentsHeaderSkeleton />}>
                    <MangaCommentsHeader params={params} />
                </Suspense>
                <Suspense fallback={null}>
                    <MangaComments params={params} target="chapter" />
                </Suspense>
            </div>
        </div>
    );
}

async function MangaCommentsHeaderSkeleton() {
    return (
        <div className="flex flex-row gap-4 items-start bg-card rounded-lg p-4 border">
            <Skeleton className="rounded-lg object-cover w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0" />
            <div className="flex flex-col min-w-0 flex-1 gap-2">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
            </div>
        </div>
    );
}

async function MangaCommentsHeader({ params }: MangaReaderCommentsProps) {
    const mangaParams = await params;
    const { data: mangaData, error: mangaError } = await getManga(
        mangaParams.id,
    );

    if (mangaError || !mangaData) {
        return <ErrorPage error={mangaError} />;
    }

    const manga = mangaData.data;
    return (
        <div className="flex flex-row gap-4 items-start bg-card rounded-lg p-4 border">
            <Image
                src={manga.cover}
                alt={manga.title}
                className="rounded-lg object-cover w-20 h-28 sm:w-24 sm:h-32 flex-shrink-0"
                width={150}
                height={200}
                sizes={generateSizes({
                    sm: "96px",
                    default: "128px",
                })}
            />
            <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-bold">{manga.title}</h1>
                <p className="text-sm text-muted-foreground">
                    Chapter {mangaParams.subId}
                </p>
                <Link
                    href={`/manga/${manga.id}/${mangaParams.subId}`}
                    className="text-sm text-primary hover:underline"
                >
                    Back to Chapter
                </Link>
            </div>
        </div>
    );
}
